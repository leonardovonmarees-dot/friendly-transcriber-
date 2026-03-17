import { NextResponse } from "next/server";

const maxFileSizeInBytes = 25 * 1024 * 1024;
const allowedExtensions = new Set([
  "mp3",
  "wav",
  "m4a",
  "aac",
  "ogg",
  "mp4",
  "webm",
  "mpeg",
  "mpga"
]);

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Defina OPENAI_API_KEY antes de iniciar o servidor." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const language = String(formData.get("language") ?? "pt");
  const prompt = String(formData.get("prompt") ?? "");
  const responseFormat = String(formData.get("response_format") ?? "text");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo invalido." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "O arquivo enviado esta vazio." }, { status: 400 });
  }

  if (file.size > maxFileSizeInBytes) {
    return NextResponse.json(
      { error: "O arquivo excede 25 MB. Divida ou converta o material antes de enviar." },
      { status: 400 }
    );
  }

  if (!allowedExtensions.has(getExtension(file.name))) {
    return NextResponse.json(
      { error: "Formato nao suportado. Envie audio ou video em um formato compativel." },
      { status: 400 }
    );
  }

  const openAiFormData = new FormData();
  openAiFormData.append("file", file, file.name);
  openAiFormData.append("model", "gpt-4o-mini-transcribe");
  openAiFormData.append("language", language);
  openAiFormData.append("response_format", responseFormat);

  if (prompt.trim()) {
    openAiFormData.append("prompt", prompt.trim());
  }

  const openAiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: openAiFormData
  });

  if (!openAiResponse.ok) {
    const errorText = await openAiResponse.text();
    return NextResponse.json(
      { error: `Erro na API de transcricao: ${errorText}` },
      { status: openAiResponse.status }
    );
  }

  const filename = file.name.replace(/\.[^.]+$/, "");

  if (responseFormat === "verbose_json") {
    const json = await openAiResponse.json();
    return NextResponse.json({
      outputFormat: responseFormat,
      text: JSON.stringify(json, null, 2),
      filename
    });
  }

  const text = await openAiResponse.text();
  return NextResponse.json({
    outputFormat: responseFormat,
    text,
    filename
  });
}
