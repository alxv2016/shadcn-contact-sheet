"use client"

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/radix/ui/attachment"
import { Bubble, BubbleContent } from "@/registry/radix/ui/bubble"
import { Button } from "@/registry/radix/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/registry/radix/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/registry/radix/ui/input-group"
import { Marker, MarkerContent, MarkerIcon } from "@/registry/radix/ui/marker"
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageGroup,
} from "@/registry/radix/ui/message"
import { IconPlaceholder } from "@/preview/icon-placeholder"

export function AssistantChat() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assistant</CardTitle>
        <CardDescription>Token audit · 3 files</CardDescription>
      </CardHeader>
      <CardContent>
        <MessageGroup className="gap-5">
          <Message align="end">
            <MessageContent>
              <Bubble variant="tinted" align="end">
                <BubbleContent>
                  Which semantic tokens are not used by any component?
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
          <Marker variant="separator">
            <MarkerIcon>
              <IconPlaceholder lucide="CheckIcon" />
            </MarkerIcon>
            <MarkerContent>Worked for 12s</MarkerContent>
          </Marker>
          <Message>
            <MessageContent>
              <Bubble variant="ghost">
                <BubbleContent>
                  Four spacing tokens have no consumers: inset-panel,
                  inset-section, stack-xl and layout-section. Every radius and
                  elevation token is in use.
                </BubbleContent>
              </Bubble>
              <Attachment size="sm" className="w-full">
                <AttachmentMedia>
                  <IconPlaceholder lucide="FileCodeIcon" />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>unused-tokens.json</AttachmentTitle>
                  <AttachmentDescription>JSON · 4 entries</AttachmentDescription>
                </AttachmentContent>
              </Attachment>
              <MessageFooter className="gap-1">
                <Button variant="ghost" size="icon-xs" aria-label="Copy">
                  <IconPlaceholder lucide="CopyIcon" />
                </Button>
                <Button variant="ghost" size="icon-xs" aria-label="Good response">
                  <IconPlaceholder lucide="ThumbsUpIcon" />
                </Button>
                <Button variant="ghost" size="icon-xs" aria-label="Retry">
                  <IconPlaceholder lucide="RefreshCwIcon" />
                </Button>
              </MessageFooter>
            </MessageContent>
          </Message>
          <Message align="end">
            <MessageContent>
              <Bubble variant="tinted" align="end">
                <BubbleContent>Remove them from the theme.</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
          <Marker role="status">
            <MarkerContent className="shimmer">Thinking…</MarkerContent>
          </Marker>
        </MessageGroup>
      </CardContent>
      <CardFooter>
        <InputGroup>
          <InputGroupTextarea placeholder="Ask about your tokens…" className="min-h-16" />
          <InputGroupAddon align="block-end">
            <InputGroupButton size="icon-xs" variant="ghost" aria-label="Attach file">
              <IconPlaceholder lucide="PaperclipIcon" />
            </InputGroupButton>
            <InputGroupButton size="icon-xs" variant="default" className="ml-auto" aria-label="Send">
              <IconPlaceholder lucide="ArrowUpIcon" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </CardFooter>
    </Card>
  )
}
