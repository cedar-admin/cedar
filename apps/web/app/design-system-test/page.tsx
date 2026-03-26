import { Button } from 'ui/src/components/shadcn/ui/button'
import { Badge } from 'ui/src/components/shadcn/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/src/components/shadcn/ui/card'
import { Input } from 'ui/src/components/shadcn/ui/input'

export default function DesignSystemTest() {
  return (
    <div className="p-8 space-y-8 bg-studio min-h-screen">
      <h1 className="text-2xl text-foreground">Design System Test</h1>
      <div className="space-x-4">
        <Button variant="default">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="space-x-2">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Test input" />
        </CardContent>
      </Card>
      <div className="space-y-2 text-sm">
        <p className="text-foreground">text-foreground</p>
        <p className="text-foreground-light">text-foreground-light</p>
        <p className="text-foreground-muted">text-foreground-muted</p>
        <p className="text-brand">text-brand</p>
        <p className="text-destructive">text-destructive</p>
        <p className="text-warning">text-warning</p>
      </div>
    </div>
  )
}
