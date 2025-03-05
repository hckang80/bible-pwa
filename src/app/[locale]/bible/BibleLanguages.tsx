'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { getLanguageFullName } from '@/lib/utils';
import { useBible } from './Provider';

export default function BibleLanguages({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { translations, isChangingBookLanguage } = useBible();

  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();

  const value = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('bibleLanguage') || locale;
  }, [locale]);

  const handleChange = useCallback(
    (language: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set('bibleLanguage', language);
      window.history.pushState(null, '', `${pathname}?${params.toString()}`);
      setOpen(false);
    },
    [pathname, setOpen]
  );

  const languages = [...new Set([...Object.values(translations).map(({ lang }) => lang)])];
  const languagesWithLabel = languages.map((language) => ({
    language,
    label: getLanguageFullName(language, language)
  }));

  return (
    <Select value={value} onValueChange={handleChange} disabled={isChangingBookLanguage}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        {languagesWithLabel.map(({ language, label }) => (
          <SelectItem value={language} key={language}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
