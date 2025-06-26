import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Hash the new password with salt rounds of 10
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Save the hash to password.json
    const filePath = path.join(process.cwd(), "app/api/admin/change-password/password.json")
    console.log("Writing password hash to:", filePath)
    await writeFile(filePath, JSON.stringify({ hash: hashedPassword }, null, 2), "utf-8")

    return NextResponse.json({
      success: true,
      message: "Password changed successfully"
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Server error", details: error?.message || String(error) }, { status: 500 })
  }
}
