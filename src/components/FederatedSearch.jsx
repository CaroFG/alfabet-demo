'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const getLocalizedValue = (hit, field, language) => {
  if (language === 'es' && hit[`${field}_es`]) {
    return hit[`${field}_es`];
  }
  return hit[field];
};

export default function FederatedSearch({ language = 'en' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MEILISEARCH_HOST}/multi-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY}`,
          },
          body: JSON.stringify({
            federation: {
              limit: 15
            },
            queries: [
              {
                indexUid: 'events',
                q: query
              },
              {
                indexUid: 'markets',
                q: query
              },
              {
                indexUid: 'selections',
                q: query
              }
            ]
          })
        });

        const data = await response.json();
        setResults(data.hits || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    fetchResults();
  }, [query]);

  const renderResult = (hit) => {
    switch (hit._federation.indexUid) {
      case 'events':
        return (
          <>
            <div className="font-medium">
              {getLocalizedValue(hit, 'team1_name', language)} vs {getLocalizedValue(hit, 'team2_name', language)}
            </div>
            <div className="text-sm text-muted-foreground">
              {getLocalizedValue(hit, 'league_name', language)}
            </div>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                Sport ID: {hit.sport_id}
              </span>
              <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                League ID: {hit.league_id}
              </span>
              <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                {hit.is_streamable ? '📺 Streamable' : '❌ Not Streamable'}
              </span>
              <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                {hit.is_live ? '🔴 Live' : '⏰ Not Live'}
              </span>
              {hit.event_state && (
                <>
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    Type: {hit.event_state.type}
                  </span>
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    Match Status: {hit.event_state.match_status}
                  </span>
                  {hit.event_state.home_score !== undefined && (
                    <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                      Score: {hit.event_state.home_score} - {hit.event_state.away_score}
                    </span>
                  )}
                </>
              )}
            </div>
            {hit.main_market_details && hit.main_market_details.map((market, idx) => (
              <div key={idx} className="mt-2 bg-muted/30 rounded px-2 py-1.5">
                <div className="flex items-center gap-2 text-xs mb-1.5">
                  <div className="font-medium">{market.market_name}</div>
                  <div className="text-muted-foreground">ID: {market.market_type_id}</div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {market.selections.map((selection, selIdx) => (
                    <div key={selIdx} className="bg-background/50 rounded px-2 py-1 text-center">
                      <div className="text-xs font-medium truncate">{selection.name}</div>
                      <div className="text-sm font-semibold text-primary">
                        {selection.odds_formats.decimal}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {selection.odds_formats.american}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        );
      
      case 'markets':
        return (
          <>
            <div className="font-medium">{getLocalizedValue(hit, 'name', language)}</div>
            <div className="text-sm text-muted-foreground">
              {getLocalizedValue(hit, 'team1_name', language)} vs {getLocalizedValue(hit, 'team2_name', language)} • {getLocalizedValue(hit, 'league_name', language)}
            </div>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                {hit.enabled_for_early_payout ? '💰 Early Payout Enabled' : '❌ No Early Payout'}
              </span>
              <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                {hit.is_valid_for_sgp ? '✅ Valid for SGP' : '❌ Not Valid for SGP'}
              </span>
            </div>
          </>
        );
      
      case 'selections':
        return (
          <>
            <div className="font-medium">
              {getLocalizedValue(hit, 'name', language)} - {getLocalizedValue(hit, 'market_name', language)}
            </div>
            <div className="text-sm text-muted-foreground">
              {getLocalizedValue(hit, 'team1_name', language)} vs {getLocalizedValue(hit, 'team2_name', language)} • {getLocalizedValue(hit, 'league_name', language)}
            </div>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                🔑 UID: {hit.selection_uid}
              </span>
              {hit.odds_formats && (
                <>
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    Decimal: {hit.odds_formats.decimal}
                  </span>
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    American: {hit.odds_formats.american}
                  </span>
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    Fractional: {hit.odds_formats.fractional}
                  </span>
                </>
              )}
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  const placeholder = language === 'es' ? 
    "Buscar todo..." : 
    "Search everything...";

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="my-8">
        <Input
          type="search"
          placeholder={placeholder}
          className="w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="divide-y">
          {results.map((hit, index) => (
            <div key={index} className="py-4 first:pt-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-3 py-1 bg-secondary text-secondary-foreground rounded">
                  {hit._federation.indexUid}
                </span>
              </div>
              {renderResult(hit)}
            </div>
          ))}
          {results.length === 0 && (
            <div className="py-6 text-center text-muted-foreground">
              {language === 'es' ? 'No se encontraron resultados' : 'No results found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 