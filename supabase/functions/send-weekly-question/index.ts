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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active users with their profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, phone, notify_email, notify_sms')
      .eq('legacy_status', 'active');

    if (profilesError) throw profilesError;

    // Get all questions
    const { data: allQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question, category');

    if (questionsError) throw questionsError;
    if (!allQuestions || allQuestions.length === 0) {
      return new Response(JSON.stringify({ message: 'No questions available' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: Array<{ userId: string; email?: string; sms?: string; status: string }> = [];

    for (const profile of profiles || []) {
      // Get user's email from auth
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(profile.id);
      if (!authUser?.email) continue;

      // Get user's answered questions
      const { data: responses } = await supabase
        .from('responses')
        .select('question_id')
        .eq('user_id', profile.id);

      const answeredIds = responses?.map(r => r.question_id).filter(Boolean) || [];
      const unanswered = allQuestions.filter(q => !answeredIds.includes(q.id));
      const pool = unanswered.length > 0 ? unanswered : allQuestions;
      const question = pool[Math.floor(Math.random() * pool.length)];

      const appUrl = Deno.env.get('APP_URL') || `${supabaseUrl.replace('.supabase.co', '')}.lovable.app`;
      const answerLink = `${appUrl}/answer?q=${question.id}`;
      const firstName = profile.display_name?.split(' ')[0] || 'there';

      // Send email notification
      if (profile.notify_email !== false) {
        try {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Matter <hello@mattermore.xyz>',
              to: [authUser.email],
              subject: `${firstName}, this week's question is here`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                  <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px;">This Week's Question</p>
                  <h1 style="font-family: Georgia, serif; font-size: 28px; color: #171717; line-height: 1.3; margin-bottom: 32px;">${question.question}</h1>
                  <a href="${answerLink}" style="display: inline-block; background: #171717; color: #fff; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-size: 16px; font-weight: 500;">Answer now</a>
                  <p style="color: #999; font-size: 13px; margin-top: 40px;">Take a moment to reflect. Your answer is private and becomes part of your legacy.</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
                  <p style="color: #ccc; font-size: 11px;">Matter · Preserving what matters most</p>
                </div>
              `,
            }),
          });
          const emailBody = await emailRes.text();
          results.push({ userId: profile.id, email: authUser.email, status: emailRes.ok ? 'email_sent' : `email_failed: ${emailBody}` });
        } catch (emailError) {
          results.push({ userId: profile.id, email: authUser.email, status: `email_error: ${emailError}` });
        }
      }

      // Send SMS notification  
      if (profile.notify_sms !== false && profile.phone) {
        try {
          const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
          const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN');
          const twilioFrom = Deno.env.get('TWILIO_PHONE_NUMBER');

          if (twilioSid && twilioAuth && twilioFrom) {
            const smsBody = `Hey ${firstName} 👋\n\nThis week's question from Matter:\n\n"${question.question}"\n\nAnswer here: ${answerLink}`;

            const smsRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                To: `+1${profile.phone}`,
                From: twilioFrom,
                Body: smsBody,
              }),
            });
            const smsResponseBody = await smsRes.text();
            results.push({ userId: profile.id, sms: profile.phone, status: smsRes.ok ? 'sms_sent' : `sms_failed: ${smsResponseBody}` });
          }
        } catch (smsError) {
          results.push({ userId: profile.id, sms: profile.phone, status: `sms_error: ${smsError}` });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-weekly-question:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
