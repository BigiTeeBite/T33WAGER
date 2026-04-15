interface WaitingRoomPageProps {
  params: {
    id: string;
  };
}

export default function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-brand-gold">Waiting Room</h1>
      <p className="mt-2 text-zinc-300">Room ID: {params.id}</p>
    </main>
  );
}
