"use client"
import { useRouter } from 'next/navigation'

export default function App() {
  const router = useRouter();

  return (
    <>
    <div className="h-full text-center align-items-center gap-4">
      <button className="bg-white rounded text-black px-4" onClick={() => router.push('/practice')}>Practice</button>
      <button className="bg-white rounded text-black px-4" onClick={() => router.push('/duel/')}>Multiplayer</button>
    </div>
    </>
  )
}