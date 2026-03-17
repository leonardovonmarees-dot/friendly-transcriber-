# Friendly Transcriber

Aplicativo web para transcrever arquivos de audio e video com interface amigavel, suporte a varios formatos e backend seguro para uso por mais de um usuario.

## O que o app faz

- aceita upload de audio e video diretamente no navegador
- envia o arquivo ao backend sem expor a chave da OpenAI no cliente
- usa o modelo `gpt-4o-mini-transcribe` para gerar transcricao
- permite baixar o resultado em `txt`, `srt`, `vtt` ou `json`
- foi pensado para deploy rapido na Vercel

## Stack

- Next.js 15
- React 19
- TypeScript
- rota de API no proprio app para facilitar deploy unico

## Variavel de ambiente

Crie um arquivo `.env.local` com:

```env
OPENAI_API_KEY=cole_sua_chave_aqui
```

## Como rodar localmente

1. Instale Node.js 20 ou superior.
2. Instale as dependencias:

```bash
npm install
```

3. Rode em desenvolvimento:

```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000).

## Como publicar online

### Opcao recomendada: Vercel

1. Envie este projeto para um repositorio GitHub.
2. Importe o repositorio na [Vercel](https://vercel.com).
3. Adicione a variavel `OPENAI_API_KEY` nas configuracoes do projeto.
4. Publique.

Depois disso, voce recebe um link publico para usar em mais de um computador e com mais de um usuario.

## Observacoes

- a rota atual segue o limite de 25 MB por arquivo da API de transcricao
- formatos previstos nesta versao: `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav`, `webm`, `aac` e `ogg`
- para aceitar `mov`, `mkv`, `flac` e arquivos longos, a proxima melhoria recomendada e converter o material no servidor com FFmpeg antes do envio
- para arquivos muito longos, o ideal e implementar particionamento ou fila assincrona
- se quiser login, historico ou banco de dados, isso pode ser a proxima etapa
