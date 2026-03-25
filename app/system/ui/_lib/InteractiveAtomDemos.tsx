'use client'

import { Box, Button, Card, ContextMenu, DropdownMenu, Flex, HoverCard, IconButton, Popover, Text } from '@radix-ui/themes'

export function ContextMenuDemo() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Box className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[var(--cedar-border-strong)] bg-[var(--cedar-interactive-hover)] px-6 py-10 text-center">
          <Text as="span" size="3" color="gray">
            Right-click here
          </Text>
        </Box>
      </ContextMenu.Trigger>
      <ContextMenu.Content variant="soft" color="gray">
        <ContextMenu.Item shortcut="⌘ E">Edit</ContextMenu.Item>
        <ContextMenu.Item shortcut="⌘ D">Duplicate</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Sub>
          <ContextMenu.SubTrigger>More</ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item>Move to project…</ContextMenu.Item>
            <ContextMenu.Item>Move to folder…</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item>Advanced options…</ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>
        <ContextMenu.Separator />
        <ContextMenu.Item shortcut="⌘ ⇧ S">Share</ContextMenu.Item>
        <ContextMenu.Item>Add to favorites</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item color="red" shortcut="⌘ ⌫">Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

export function DropdownMenuDemo() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="soft" color="gray">
          Open menu
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content variant="soft" color="gray">
        <DropdownMenu.Item shortcut="⌘ E">Edit</DropdownMenu.Item>
        <DropdownMenu.Item shortcut="⌘ D">Duplicate</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>Archive</DropdownMenu.Item>
        <DropdownMenu.Item color="red">Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export function PopoverDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="soft" color="gray">
          Open popover
        </Button>
      </Popover.Trigger>
      <Popover.Content size="2" width="320px">
        <Flex direction="column" gap="2">
          <Text as="span" size="2" weight="medium">
            Quick metadata
          </Text>
          <Text as="p" size="2" color="gray">
            Popover is best for lightweight anchored detail that supports the current task without becoming a full panel.
          </Text>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}

export function HoverCardDemo() {
  return (
    <HoverCard.Root openDelay={50} closeDelay={100}>
      <HoverCard.Trigger href="#">
        <Text as="span" size="2" className="underline underline-offset-4">
          Hover preview
        </Text>
      </HoverCard.Trigger>
      <HoverCard.Content maxWidth="320px">
        <Card variant="surface">
          <Box p="3">
            <Flex direction="column" gap="2">
              <Text as="span" size="2" weight="medium">
                Source snapshot
              </Text>
              <Text as="p" size="2" color="gray">
                Use hover cards for secondary preview context only. If the information is important to task completion, keep it visible in the layout.
              </Text>
            </Flex>
          </Box>
        </Card>
      </HoverCard.Content>
    </HoverCard.Root>
  )
}

export function IconButtonDemo() {
  return (
    <Flex gap="2" wrap="wrap" align="center">
      <IconButton variant="ghost" color="gray" aria-label="Search">
        <i className="ri-search-line" aria-hidden="true" />
      </IconButton>
      <IconButton variant="soft" color="gray" aria-label="Pin">
        <i className="ri-pushpin-line" aria-hidden="true" />
      </IconButton>
      <IconButton variant="solid" color="red" aria-label="Delete">
        <i className="ri-delete-bin-line" aria-hidden="true" />
      </IconButton>
    </Flex>
  )
}
