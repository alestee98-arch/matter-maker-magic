import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Play, Edit, Lock, Share, Archive } from "lucide-react";

const MOCK_PROFILE = {
  id: "user_001",
  name: "Alexis Martínez",
  handle: "@alexis",
  avatar: "https://i.pravatar.cc/160?img=13",
  bio: "Building MATTER — preserving essence through time. Lover of wellness, AI, and good questions.",
  location: "Ciudad de México, MX",
  joined: "2025-02-14",
  stats: {
    answers: 87,
    streakWeeks: 12,
    categories: 9
  },
  privacyDefault: "Private",
  legacyExecutor: "María Martínez (Hermana)",
};

const MOCK_PROMPTS = [
  {
    id: "p_203",
    depth: "Ligera",
    text: "¿Cuál es una canción que te levanta el ánimo al instante?",
  },
  {
    id: "p_204",
    depth: "Media", 
    text: "Cuenta una pequeña decisión que cambió tu trayectoria más de lo que imaginabas.",
  },
  {
    id: "p_205",
    depth: "Profunda",
    text: "¿Qué le dirías a tu yo de 17 años sobre el amor y el fracaso?",
  },
];

const MOCK_ENTRIES = [
  {
    id: "e_118",
    title: "Aprendiendo a fallar bien",
    date: "2025-08-21",
    category: "Lecciones",
    privacy: "Private",
    summary: "Cómo redefiní el fracaso como retroalimentación y ritmo.",
    mediaType: "video",
    duration: "02:34",
    transcriptSnippet: "Fallar no me rompió; me enseñó a escuchar más…",
  },
  {
    id: "e_117",
    title: "Lo que significa familia para mí",
    date: "2025-08-14",
    category: "Familia",
    privacy: "Share",
    mediaType: "audio",
    duration: "03:18",
    transcriptSnippet: "La mesa del domingo fue el primer aula…",
  },
  {
    id: "e_116", 
    title: "Mi relación con el trabajo y la calma",
    date: "2025-08-07",
    category: "Trabajo",
    privacy: "Private",
    mediaType: "text",
    duration: null,
    transcriptSnippet: "La ambición sin descanso se queda vacía…",
  },
  {
    id: "e_115",
    title: "Una alegría pequeña (y diaria)",
    date: "2025-07-31",
    category: "Alegría", 
    privacy: "Legacy",
    mediaType: "audio",
    duration: "01:11",
    transcriptSnippet: "El primer sorbo de café, antes de que el mundo me encuentre…",
  },
];

const CATEGORIES = [
  "Todos",
  "Amor", 
  "Familia",
  "Trabajo",
  "Salud",
  "Alegría",
  "Miedo",
  "Lecciones",
  "Amistad",
];

export default function ProfilePage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("Todos");

  const filtered = useMemo(() => {
    return MOCK_ENTRIES.filter((e) => {
      const matchCat = activeCat === "Todos" ? true : e.category === activeCat;
      const q = query.trim().toLowerCase();
      const matchQ = !q
        ? true
        : (e.title + " " + e.summary + " " + e.transcriptSnippet)
            .toLowerCase()
            .includes(q);
      return matchCat && matchQ;
    });
  }, [query, activeCat]);

  return (
    <div className="space-y-6">
      <ProfileHeader profile={MOCK_PROFILE} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PromptCard prompts={MOCK_PROMPTS} />
        </div>
        <LegacyCard profile={MOCK_PROFILE} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Tu archivo</CardTitle>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <SearchInput value={query} onChange={setQuery} />
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar todo
              </Button>
            </div>
          </div>
          <FiltersBar
            categories={CATEGORIES}
            active={activeCat}
            onChange={setActiveCat}
          />
        </CardHeader>
        <CardContent>
          <Timeline entries={filtered} />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileHeader({ profile }: { profile: any }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-20 w-20 rounded-xl object-cover ring-2 ring-border"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
              <p className="text-muted-foreground">{profile.handle} · {profile.location}</p>
              <p className="mt-2 max-w-prose text-sm text-foreground">{profile.bio}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{profile.stats.answers} respuestas</Badge>
                <Badge variant="secondary">{profile.stats.streakWeeks} semanas seguidas</Badge>
                <Badge variant="secondary">{profile.stats.categories} categorías</Badge>
                <Badge variant="secondary">Desde {new Date(profile.joined).toLocaleDateString()}</Badge>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-2 md:w-auto md:items-end">
            <p className="text-sm text-muted-foreground">Privacidad predeterminada</p>
            <div className="flex items-center gap-2">
              <PrivacyPill level={profile.privacyDefault} />
              <Button variant="outline" size="sm">Cambiar</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PrivacyPill({ level }: { level: string }) {
  const variants = {
    Private: { bg: "bg-secondary", icon: Lock },
    Share: { bg: "bg-premium-blue/20 text-premium-blue", icon: Share },
    Legacy: { bg: "bg-premium-amber/20 text-premium-amber", icon: Archive },
  };
  
  const variant = variants[level as keyof typeof variants] || { bg: "bg-secondary", icon: Lock };
  const Icon = variant.icon;
  
  return (
    <Badge className={variant.bg}>
      <Icon className="mr-1 h-3 w-3" />
      {level}
    </Badge>
  );
}

function PromptCard({ prompts }: { prompts: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pregunta de esta semana</CardTitle>
        <p className="text-sm text-muted-foreground">Elige una y responde en texto, audio o video.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {prompts.map((p) => (
            <button key={p.id} className="flex h-full flex-col justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-secondary">
              <Badge variant="outline" className="mb-2 w-fit">{p.depth}</Badge>
              <span className="text-sm leading-relaxed">{p.text}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button>Responder ahora</Button>
          <Button variant="outline">Programar para más tarde</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LegacyCard({ profile }: { profile: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Legado</CardTitle>
        <p className="text-sm text-muted-foreground">Controla qué se comparte y cuándo.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Ejecutor/a de legado</span>
            <span className="font-medium">{profile.legacyExecutor}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Exportar archivo</span>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Descargar .zip
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span>Estado</span>
            <Badge className="bg-premium-green/20 text-premium-green">Cifrado y respaldado</Badge>
          </div>
        </div>
        <div className="rounded-lg bg-secondary p-4 text-sm">
          <p>
            <strong>Privacidad:</strong> Cada respuesta puede marcarse como <em>Privada</em>,
            <em> Compartida</em> (visible para tu círculo) o <em>Legado</em> (visible solo después de tu fallecimiento).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative w-full md:w-80">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por tema, frase o recuerdo…"
        className="pl-10"
      />
    </div>
  );
}

function FiltersBar({ categories, active, onChange }: { categories: string[]; active: string; onChange: (cat: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <Button
          key={c}
          variant={active === c ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(c)}
        >
          {c}
        </Button>
      ))}
    </div>
  );
}

function Timeline({ entries }: { entries: any[] }) {
  if (!entries.length) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        No hay entradas con esos filtros todavía.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {entries.map((e) => (
        <EntryCard key={e.id} entry={e} />
      ))}
    </div>
  );
}

function EntryCard({ entry }: { entry: any }) {
  const mediaBadge = {
    video: { icon: Play, label: "Video" },
    audio: { icon: Play, label: "Audio" },
    text: { icon: Edit, label: "Texto" },
  };

  const privacyTint = {
    Private: "bg-secondary",
    Share: "bg-premium-blue/20 text-premium-blue",
    Legacy: "bg-premium-amber/20 text-premium-amber",
  };

  const mediaInfo = mediaBadge[entry.mediaType as keyof typeof mediaBadge];
  const MediaIcon = mediaInfo.icon;

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{entry.title}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(entry.date).toLocaleDateString()} · {entry.category}
            </p>
          </div>
          <Badge className={privacyTint[entry.privacy as keyof typeof privacyTint]}>{entry.privacy}</Badge>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          {entry.transcriptSnippet}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Badge variant="outline" className="flex items-center gap-1">
            <MediaIcon className="h-3 w-3" />
            {mediaInfo.label}
            {entry.duration && ` · ${entry.duration}`}
          </Badge>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Ver</Button>
            <Button variant="outline" size="sm">Editar</Button>
            <Button variant="outline" size="sm">Privacidad</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}