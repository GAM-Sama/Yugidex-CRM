"use server"

import { createClient } from "@/lib/supabase/server"
// 'revalidatePath' ya no es necesario para esta acción
// import { revalidatePath } from "next/cache"

export async function updateUserProfile(formData: FormData) {
const supabase = await createClient()

  // --- CAMBIO 1: Verificación de usuario (Buena práctica) ---
  // Nos aseguramos de que el usuario está autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "No autorizado. Por favor, inicia sesión." }
  }

  // --- CAMBIO 2: Obtenemos los datos del formulario ---
  // const firstName = formData.get("firstName") as string // Eliminado
  // const lastName = formData.get("lastName") as string // Eliminado
  const username = formData.get("username") as string // Añadido
  const bio = formData.get("bio") as string
  const location = formData.get("location") as string
  const website = formData.get("website") as string

  // --- CAMBIO 3: Actualizamos user_metadata con 'username' ---
  const { error } = await supabase.auth.updateUser({
    data: {
      // first_name: firstName, // Eliminado
      // last_name: lastName, // Eliminado
      username: username, // Añadido
      bio: bio,
      location: location,
      website: website,
    },
  })
  // --- FIN DE LOS CAMBIOS ---

  if (error) {
    console.error("Error al actualizar el perfil:", error)
    return {
      error: `No se pudo actualizar el perfil: ${error.message}`,
    }
  }

  // --- CAMBIO 4: Eliminamos revalidatePath ---
  // revalidatePath("/profile") // Eliminado
  // Dejamos que el 'ProfileForm' (cliente) maneje el refresco
  // con supabase.auth.refreshSession() y router.refresh().
  // Esto es necesario para que el cookie de sesión se actualice.

  return {
    success: "Perfil actualizado correctamente.",
  }
}