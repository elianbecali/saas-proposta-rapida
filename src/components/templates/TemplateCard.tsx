import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import type { Template } from '@/types'

export function TemplateCard({ template }: { template: Template }) {
  const preview = template.content.slice(0, 120).replace(/#+\s/g, '').replace(/\n/g, ' ')

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">{template.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-gray-500 line-clamp-3">{preview}...</p>
      </CardContent>
      <CardFooter>
        <Link
          href={`/proposals/new?templateId=${template.id}`}
          className={cn(buttonVariants({ size: 'sm' }), 'w-full justify-center')}
        >
          Usar este template
        </Link>
      </CardFooter>
    </Card>
  )
}
