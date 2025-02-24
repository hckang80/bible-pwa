'use client';

import type { BibleInstance, Transition } from '@/@types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';

import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { cn, fetcher } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export default function Container({
  translations,
  data: initialData
}: {
  translations: Transition[];
  data: BibleInstance;
}) {
  const [selectedTranslation, setSelectedTranslation] = useState<Transition | undefined>(
    translations[0]
  );

  const {
    data: { books }
  } = useQuery({
    queryKey: ['bible', selectedTranslation],
    queryFn: () => fetcher<BibleInstance>(`/api/${selectedTranslation?.abbreviation}.json`),
    initialData
  });

  const [{ name: DEFAULT_BOOK }] = books;
  const DEFAULT_CHAPTER = 1;

  const [selectedBookInstance, setSelectedBookInstance] = useState<{
    book: string;
    chapter: number;
  }>({ book: DEFAULT_BOOK, chapter: DEFAULT_CHAPTER });

  const resetBook = useCallback((book: string, chapter: number) => {
    setSelectedBookInstance({ book, chapter });
  }, []);

  useEffect(() => {
    resetBook(DEFAULT_BOOK, DEFAULT_CHAPTER);
  }, [resetBook, DEFAULT_BOOK, DEFAULT_CHAPTER]);

  const chapters = useMemo(
    () => books.find((book) => book.name === selectedBookInstance.book)?.chapters || [],
    [books, selectedBookInstance.book]
  );

  const verses = useMemo(
    () =>
      chapters.find((chapter) => chapter.chapter === selectedBookInstance.chapter)?.verses || [],
    [chapters, selectedBookInstance.chapter]
  );

  const handleTranslationChange = (value: string) => {
    setSelectedTranslation(() => translations.find(({ abbreviation }) => abbreviation === value));
  };

  if (!selectedTranslation) return 'SELECTED_TRANSLATION is empty';

  return (
    <>
      <div className="flex gap-[4px]">
        <Drawer>
          <DrawerTrigger asChild>
            <Button>{`${selectedBookInstance.book} ${selectedBookInstance.chapter}`}</Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[calc(100vh-50px)] max-h-[calc(100dvh-50px)]">
            <DrawerHeader className="overflow-y-auto p-0">
              <DrawerTitle className="hidden">Bible</DrawerTitle>
              <DrawerDescription asChild>
                <div className="text-left">
                  {books.map(({ name: book, chapters: { length } }) => (
                    <details
                      name="books"
                      key={book}
                      className="group transition-[max-height] duration-400 ease-in-out max-h-[80px] open:max-h-[800px]"
                    >
                      <summary
                        className={cn(
                          'flex justify-between p-[10px]',
                          book === selectedBookInstance.book ? 'font-bold' : ''
                        )}
                      >
                        {book}
                        <ChevronDown size={20} className="transition group-open:rotate-180" />
                      </summary>
                      <div className="grid grid-cols-5 gap-[4px] px-[10px]">
                        {Array.from({ length }, (_, i) => (
                          <DrawerClose key={i} asChild>
                            <Button
                              variant="outline"
                              onClick={() => {
                                resetBook(book, i + 1);
                              }}
                            >
                              {i + 1}
                            </Button>
                          </DrawerClose>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>

        <Drawer>
          <DrawerTrigger asChild>
            <Button>{selectedTranslation.distribution_versification}</Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[calc(100vh-50px)] max-h-[calc(100dvh-50px)]">
            <DrawerHeader className="overflow-y-auto p-0">
              <DrawerTitle className="hidden">Translations</DrawerTitle>
              <DrawerDescription asChild>
                <ul>
                  {translations.map(({ distribution_versification, abbreviation, description }) => (
                    <li key={abbreviation}>
                      <DrawerClose asChild>
                        <button
                          className={cn(
                            'w-full p-[10px] text-left',
                            abbreviation === selectedTranslation.abbreviation ? 'font-bold' : ''
                          )}
                          onClick={() => handleTranslationChange(abbreviation)}
                        >
                          {`${distribution_versification}(${description})`}
                        </button>
                      </DrawerClose>
                    </li>
                  ))}
                </ul>
              </DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </div>

      <div>
        {verses.map((verse) => (
          <p key={verse.verse}>
            <sup>{verse.verse}</sup> {verse.text}
          </p>
        ))}
      </div>
    </>
  );
}
