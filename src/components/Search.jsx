'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const getLocalizedValue = (hit, field, language) => {
  if (language === 'es' && hit[`${field}_es`]) {
    return hit[`${field}_es`];
  }
  return hit[field];
};

export default function Search({ language = 'en' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    events: [],
    markets: [],
    selections: []
  });

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
            queries: [
              {
                indexUid: 'events',
                q: query,
                limit: 5
              },
              {
                indexUid: 'markets',
                q: query,
                limit: 5
              },
              {
                indexUid: 'selections',
                q: query,
                limit: 5
              }
            ]
          })
        });

        const data = await response.json();
        setResults({
          events: data.results[0].hits,
          markets: data.results[1].hits,
          selections: data.results[2].hits
        });
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    fetchResults();
  }, [query]);

  const placeholder = language === 'es' ? 
    "Buscar eventos, mercados y selecciones..." : 
    "Search events, markets, and selections...";

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

      <div className="space-y-6">
        {/* Events Results */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'es' ? 'Eventos' : 'Events'}</CardTitle>
          </CardHeader>
          <CardContent>
            {results.events.map((event, index) => (
              <div key={index} className="py-2 border-b last:border-b-0">
                <div className="font-medium">
                  {getLocalizedValue(event, 'team1_name', language)} vs {getLocalizedValue(event, 'team2_name', language)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getLocalizedValue(event, 'league_name', language)}
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    Sport ID: {event.sport_id}
                  </span>
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    League ID: {event.league_id}
                  </span>
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    {event.is_streamable ? '📺 Streamable' : '❌ Not Streamable'}
                  </span>
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    {event.is_live ? '🔴 Live' : '⏰ Not Live'}
                  </span>
                  {event.event_state && (
                    <>
                      <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                        Type: {event.event_state.type}
                      </span>
                      <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                        Match Status: {event.event_state.match_status}
                      </span>
                      {event.event_state.home_score !== undefined && (
                        <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                          Score: {event.event_state.home_score} - {event.event_state.away_score}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {event.main_markets && event.main_markets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {event.main_markets.map((marketId, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium"
                      >
                        {marketId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {results.events.length === 0 && (
              <div className="text-muted-foreground">
                {language === 'es' ? 'No se encontraron eventos' : 'No events found'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Markets Results */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'es' ? 'Mercados' : 'Markets'}</CardTitle>
          </CardHeader>
          <CardContent>
            {results.markets.map((market, index) => (
              <div key={index} className="py-2 border-b last:border-b-0">
                <div className="font-medium">{getLocalizedValue(market, 'name', language)}</div>
                <div className="text-sm text-muted-foreground">
                  {getLocalizedValue(market, 'team1_name', language)} vs {getLocalizedValue(market, 'team2_name', language)} • {getLocalizedValue(market, 'league_name', language)}
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    {market.enabled_for_early_payout ? '💰 Early Payout Enabled' : '❌ No Early Payout'}
                  </span>
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    {market.is_valid_for_sgp ? '✅ Valid for SGP' : '❌ Not Valid for SGP'}
                  </span>
                </div>
              </div>
            ))}
            {results.markets.length === 0 && (
              <div className="text-muted-foreground">
                {language === 'es' ? 'No se encontraron mercados' : 'No markets found'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selections Results */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'es' ? 'Selecciones' : 'Selections'}</CardTitle>
          </CardHeader>
          <CardContent>
            {results.selections.map((selection, index) => (
              <div key={index} className="py-2 border-b last:border-b-0">
                <div className="font-medium">
                  {getLocalizedValue(selection, 'name', language)} - {getLocalizedValue(selection, 'market_name', language)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getLocalizedValue(selection, 'team1_name', language)} vs {getLocalizedValue(selection, 'team2_name', language)} • {getLocalizedValue(selection, 'league_name', language)}
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                    🔑 UID: {selection.selection_uid}
                  </span>
                  {selection.odds_formats && (
                    <>
                      <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                        Decimal: {selection.odds_formats.decimal}
                      </span>
                      <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                        American: {selection.odds_formats.american}
                      </span>
                      <span className="inline-flex items-center rounded bg-secondary/20 px-2 py-1">
                        Fractional: {selection.odds_formats.fractional}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
            {results.selections.length === 0 && (
              <div className="text-muted-foreground">
                {language === 'es' ? 'No se encontraron selecciones' : 'No selections found'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 