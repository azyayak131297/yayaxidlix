import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import SubtitleForm from "../../SubtitleForm"

export const dynamic = "force-dynamic"

export default async function EditSubtitlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const subtitle = await prisma.subtitle.findUnique({
    where: { id },
  })

  if (!subtitle) {
    notFound()
  }

  return (
    <SubtitleForm
      mode="edit"
      initialData={{
        id: subtitle.id,
        contentId: subtitle.contentId,
        contentType: subtitle.contentType,
        episodeKey: subtitle.episodeKey || undefined,
        language: subtitle.language,
        label: subtitle.label,
        format: subtitle.format,
        isDefault: subtitle.isDefault,
        url: subtitle.url,
      }}
    />
  )
}
