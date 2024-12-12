import { Slot } from "expo-router"
import { SQLiteProvider } from "expo-sqlite"

import  initializeDatabase  from "@/database/initializeDatabase"

export default function Layout() {
  return (
    <SQLiteProvider databaseName="atletas.db" onInit={initializeDatabase}>
      <Slot />
    </SQLiteProvider>
  )
}