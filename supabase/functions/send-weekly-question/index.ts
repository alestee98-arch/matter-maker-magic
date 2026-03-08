import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const appUrl = Deno.env.get('APP_URL') || 'https://mattermore.xyz';
  const results: Array<Record<string, unknown>> = [];

  try {
    // Fetch all active users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, phone, notify_email, notify_sms, age_group, current_sequence_position')
      .eq('legacy_status', 'active')
      .eq('onboarding_completed', true);

    if (profilesError) throw profilesError;
    if (!profiles?.length) {
      return new Response(JSON.stringify({ success: true, message: 'No active users', results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const profile of profiles) {
      try {
        const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
        const email = authData?.user?.email;
        if (!email) continue;

        const firstName = profile.display_name?.split(' ')[0] || 'there';
        let question: { id: string; question: string; category: string } | null = null;

        // --- SEQUENCED QUESTION SELECTION ---
        if (profile.age_group) {
          // Get next question in their sequence
          const { data: seqQuestion } = await supabase
            .from('question_sequences')
            .select('question_id, position, questions(id, question, category)')
            .eq('age_group', profile.age_group)
            .gte('position', profile.current_sequence_position ?? 1)
            .order('position', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (seqQuestion?.questions) {
            const q = seqQuestion.questions as any;
            question = { id: q.id, question: q.question, category: q.category };
          }
        }

        // --- FALLBACK: pick unanswered random question ---
        if (!question) {
          const { data: answered } = await supabase
            .from('responses')
            .select('question_id')
            .eq('user_id', profile.id);

          const answeredIds = answered?.map(r => r.question_id).filter(Boolean) || [];

          const { data: allQuestions } = await supabase
            .from('questions')
            .select('id, question, category');

          if (allQuestions?.length) {
            const unanswered = allQuestions.filter(q => !answeredIds.includes(q.id));
            const pool = unanswered.length > 0 ? unanswered : allQuestions;
            question = pool[Math.floor(Math.random() * pool.length)];
          }
        }

        if (!question) {
          results.push({ userId: profile.id, status: 'skipped: no question available' });
          continue;
        }

        const answerLink = `${appUrl}/?q=${question.id}`;

        // --- SEND EMAIL ---
        if (profile.notify_email !== false) {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Matter <hello@mattermore.xyz>',
              to: [email],
              subject: `${firstName}, this week's question is here`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #fff;">
                  <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">This Week's Question</p>
                  <h1 style="font-family: Georgia, serif; font-size: 28px; color: #171717; line-height: 1.3; margin-bottom: 20px;">${question.question}</h1>
                  <a href="${answerLink}" style="display: inline-block; background: #171717; color: #fff; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-size: 16px; font-weight: 500;">Answer now</a>
                  <p style="color: #999; font-size: 13px; margin-top: 24px; line-height: 1.6;">Your answer is private and becomes part of your legacy.</p>
                </div>
              `,
            }),
          });

          const emailStatus = emailRes.ok ? 'sent' : 'failed';
          const emailBody = await emailRes.json().catch(() => ({}));

          // Log delivery
          await supabase.from('notification_log').insert({
            user_id: profile.id,
            question_id: question.id,
            channel: 'email',
            status: emailStatus,
            provider_message_id: emailBody?.id || null,
            error_message: emailRes.ok ? null : JSON.stringify(emailBody),
          });

          results.push({ userId: profile.id, email, question: question.question.slice(0, 50), status: `email_${emailStatus}` });
          await new Promise(r => setTimeout(r, 600)); // Resend rate limit
        }

        // --- SEND SMS ---
        if (profile.notify_sms !== false && profile.phone) {
          const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
          const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN');
          const twilioFrom = Deno.env.get('TWILIO_PHONE_NUMBER');

          if (twilioSid && twilioAuth && twilioFrom) {
            const smsBody = `${firstName}, your question this week:\n\n"${question.question}"\n\n${answerLink}`;

            const smsRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({ To: `+1${profile.phone}`, From: twilioFrom, Body: smsBody }),
            });

            const smsStatus = smsRes.ok ? 'sent' : 'failed';
            const smsBody2 = await smsRes.json().catch(() => ({}));

            await supabase.from('notification_log').insert({
              user_id: profile.id,
              question_id: question.id,
              channel: 'sms',
              status: smsStatus,
              provider_message_id: smsBody2?.sid || null,
              error_message: smsRes.ok ? null : JSON.stringify(smsBody2),
            });

            results.push({ userId: profile.id, phone: profile.phone, status: `sms_${smsStatus}` });
          }
        }

        // Advance sequence position
        await supabase
          .from('profiles')
          .update({ current_sequence_position: (profile.current_sequence_position ?? 0) + 1 })
          .eq('id', profile.id);

      } catch (userError) {
        results.push({ userId: profile.id, status: `error: ${userError}` });
      }
    }

    return new Response(JSON.stringify({ success: true, sent: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('send-weekly-question fatal:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
