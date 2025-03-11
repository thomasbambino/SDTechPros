import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  title: string;
}

export default function PageContainer({ children, title }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        {children}
      </main>
    </div>
  );
}
