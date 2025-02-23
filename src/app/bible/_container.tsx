'use client';

import type { BibleInstance, Transition } from '@/@types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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

  const [selectedBook, setSelectedBook] = useState(DEFAULT_BOOK);
  const [selectedChapter, setSelectedChapter] = useState(DEFAULT_CHAPTER);

  const resetBook = useCallback((book: string, chapter: number) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
  }, []);

  useEffect(() => {
    resetBook(DEFAULT_BOOK, DEFAULT_CHAPTER);
  }, [resetBook, DEFAULT_BOOK, DEFAULT_CHAPTER]);

  const chapters = useMemo(
    () => books.find((book) => book.name === selectedBook)?.chapters || [],
    [books, selectedBook]
  );

  const verses = useMemo(
    () => chapters.find((chapter) => chapter.chapter === selectedChapter)?.verses,
    [chapters, selectedChapter]
  );

  const handleTranslationChange = (value: string) => {
    setSelectedTranslation(() => translations.find(({ abbreviation }) => abbreviation === value));
  };

  return (
    <>
      <div className="flex gap-[4px]">
        <Drawer>
          <DrawerTrigger asChild>
            <Button>{`${selectedBook} ${selectedChapter}`}</Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[calc(100vh-50px)] max-h-[calc(100dvh-50px)]">
            <DrawerHeader className="overflow-y-auto">
              <DrawerTitle className="hidden">Bible</DrawerTitle>
              <DrawerDescription asChild>
                <div className="text-left">
                  {books.map(({ name: book, chapters: { length } }) => (
                    <details
                      name="books"
                      key={book}
                      className="transition-[max-height] duration-400 ease-in-out max-h-[80px] open:max-h-[800px]"
                    >
                      <summary className={cn(book === selectedBook ? 'font-bold' : '')}>
                        {book}
                      </summary>
                      <div className="grid grid-cols-5 gap-[4px]">
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

        <Select value={selectedTranslation?.abbreviation} onValueChange={handleTranslationChange}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select a translation" />
          </SelectTrigger>
          <SelectContent>
            {translations.map(({ abbreviation, description }) => (
              <SelectItem value={abbreviation} key={abbreviation}>
                {description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        {verses?.map((verse) => (
          <p key={verse.verse}>
            <sup>{verse.verse}</sup> {verse.text}
          </p>
        ))}
      </div>
    </>
  );
}
