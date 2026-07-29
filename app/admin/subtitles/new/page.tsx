"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter } from "next/navigation"
import SubtitleForm from "../SubtitleForm"

export default function NewSubtitlePage() {
  return <SubtitleForm mode="create" />
}
