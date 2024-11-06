'use client';

import { useState } from 'react';
import Search from '@/components/Search';
import FederatedSearch from '@/components/FederatedSearch';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isFederated, setIsFederated] = useState(false);
  const [language, setLanguage] = useState('en');

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-4xl mx-auto pt-4 px-4">
        <div className="flex justify-end gap-2 mb-4">
          <Button
            variant={language === 'en' ? "default" : "outline"}
            onClick={() => setLanguage('en')}
          >
            EN
          </Button>
          <Button
            variant={language === 'es' ? "default" : "outline"}
            onClick={() => setLanguage('es')}
          >
            ES
          </Button>
          <div className="w-px bg-border" /> {/* Separator */}
          <Button
            variant={!isFederated ? "default" : "outline"}
            onClick={() => setIsFederated(false)}
          >
            Separated
          </Button>
          <Button
            variant={isFederated ? "default" : "outline"}
            onClick={() => setIsFederated(true)}
          >
            Federated
          </Button>
        </div>
      </div>
      {isFederated ? 
        <FederatedSearch language={language} /> : 
        <Search language={language} />
      }
    </main>
  );
}
