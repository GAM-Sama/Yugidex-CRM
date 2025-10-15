"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient()

  // Obtenemos los datos del formulario
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const bio = formData.get("bio") as string
  const location = formData.get("location") as string
  const website = formData.get("website") as string

  // --- INICIO DE LA MODIFICACIÓN ---
  // Usamos supabase.auth.updateUser para modificar los user_metadata.
  // El objeto 'data' contiene los campos que queremos guardar.
  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: firstName,
      last_name: lastName,
      bio: bio,
      location: location,
      website: website,
    },
  })
  // --- FIN DE LA MODIFICACIÓN ---

  if (error) {
    console.error("Error al actualizar el perfil:", error)
    return {
      error: "No se pudo actualizar el perfil.",
    }
  }

  // Le decimos a Next.js que la página del perfil ha cambiado y debe recargar los datos
  revalidatePath("/profile")

  return {
    success: "Perfil actualizado correctamente.",
  }
}
