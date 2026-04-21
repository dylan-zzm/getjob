'use client';

import { Check } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function ResumePlans({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn('py-16 md:py-24', section.className, className)}
    >
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-primary text-sm font-semibold tracking-[0.18em] uppercase">
            {section.label}
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-balance md:text-5xl">
            {section.title}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-8">
            {section.description}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {section.items?.map((item, idx) => (
            <Card
              key={idx}
              className={cn(
                'relative overflow-hidden border-border/80 bg-background/90 pt-0',
                item.is_featured && 'border-primary shadow-[0_18px_56px_rgba(18,59,72,0.18)]'
              )}
            >
              <div
                className={cn(
                  'h-2 w-full bg-secondary',
                  item.is_featured && 'bg-primary'
                )}
              />
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {item.description}
                    </CardDescription>
                  </div>
                  {item.label && (
                    <Badge className="rounded-full px-2.5 py-1">{item.label}</Badge>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-semibold">{item.price}</span>
                    {item.unit && (
                      <span className="text-muted-foreground pb-1 text-sm">
                        {item.unit}
                      </span>
                    )}
                  </div>
                  {item.tip && (
                    <p className="text-muted-foreground mt-2 text-sm">{item.tip}</p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {(item.features ?? []).map((feature: string, featureIdx: number) => (
                    <div key={featureIdx} className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                        <Check className="size-3.5" />
                      </span>
                      <span className="text-sm leading-6">{feature}</span>
                    </div>
                  ))}
                </div>

                {item.button && (
                  <Button
                    asChild
                    className="h-11 w-full"
                    variant={item.button.variant || (item.is_featured ? 'default' : 'outline')}
                  >
                    <Link href={item.button.url || ''} target={item.button.target || '_self'}>
                      {item.button.icon && (
                        <SmartIcon name={item.button.icon as string} size={16} />
                      )}
                      <span>{item.button.title}</span>
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
