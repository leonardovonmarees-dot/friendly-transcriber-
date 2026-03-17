"use client";

import { FormEvent, useState } from "react";

const acceptedFormats = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
  "video/mp4",
  "video/webm",
  "video/mpeg"
];

const outputOptions = [
  { value: "text", label: "Texto puro" },
  { value: "srt", label: "Legendas .srt" },
  { value: "vtt", label: "Legendas .vtt" },
  { value: "verbose_json", label: "JSON detalhado" }
];

type ResponsePayload = {
  outputFormat: string;
  text: string;
  filename: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("pt");
  const [prompt, setPrompt] = useState("");
  const [outputFormat, setOutputFormat] = useState("text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResponsePayload | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Selecione um arquivo de audio ou video para continuar.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    formData.append("prompt", prompt);
    formData.append("response_format", outputFormat);

    try {
      const response = await fetch("/api/transcriptions", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as ResponsePayload & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao transcrever o arquivo.");
      }

      setResult(payload);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Nao foi possivel processar o arquivo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDownload() {
    if (!result) {
      return;
    }

    const extensionMap: Record<string, string> = {
      text: "txt",
      srt: "srt",
      vtt: "vtt",
      verbose_json: "json"
    };

    const blob = new Blob([result.text], {
      type: result.outputFormat === "verbose_json" ? "application/json" : "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${result.filename}.${extensionMap[result.outputFormat] ?? "txt"}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Transcricao para equipes e uso remoto</span>
          <h1>Transcreva audio e video com uma experiencia clara, bonita e pronta para web.</h1>
          <p>
            Envie entrevistas, reunioes, aulas, podcasts ou videos em formatos variados e receba o
            texto em segundos, com opcao de legenda.
          </p>
        </div>
        <div className="hero-card">
          <div className="metric">
            <strong>Formatos</strong>
            <span>MP3, WAV, M4A, AAC, OGG, MP4, MPEG e WEBM</span>
          </div>
          <div className="metric">
            <strong>Saidas</strong>
            <span>Texto, SRT, VTT ou JSON detalhado</span>
          </div>
          <div className="metric">
            <strong>Deploy</strong>
            <span>Projetado para subir com facilidade em Vercel</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="upload-zone">
            <input
              type="file"
              accept={acceptedFormats.join(",")}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <span className="upload-title">{file ? file.name : "Escolha um arquivo"}</span>
            <span className="upload-subtitle">
              Arraste ou selecione audio e video compativeis com a API.
            </span>
          </label>

          <label>
            Idioma principal
            <input
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              placeholder="pt, en, es..."
            />
          </label>

          <label>
            Formato de saida
            <select
              value={outputFormat}
              onChange={(event) => setOutputFormat(event.target.value)}
            >
              {outputOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="full-width">
            Contexto opcional
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ex.: nomes de pessoas, termos tecnicos ou contexto da gravacao."
              rows={4}
            />
          </label>

          <div className="actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Transcrevendo..." : "Iniciar transcricao"}
            </button>
            <p>
              O servidor usa a API da OpenAI para processar o arquivo com seguranca sem expor a
              chave no navegador. Limite atual por arquivo: 25 MB.
            </p>
          </div>
        </form>

        {error ? <div className="feedback error">{error}</div> : null}

        {result ? (
          <section className="result-card">
            <div className="result-header">
              <div>
                <span className="eyebrow">Resultado</span>
                <h2>Transcricao concluida</h2>
              </div>
              <button type="button" className="secondary" onClick={handleDownload}>
                Baixar arquivo
              </button>
            </div>
            <pre>{result.text}</pre>
          </section>
        ) : null}
      </section>
    </main>
  );
}
