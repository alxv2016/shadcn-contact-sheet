"use client"

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/radix/ui/attachment"
import { Avatar, AvatarFallback } from "@/registry/radix/ui/avatar"
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/registry/radix/ui/bubble"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/radix/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/radix/ui/input-group"
import { Marker, MarkerContent } from "@/registry/radix/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/registry/radix/ui/message"
import { Button } from "@/registry/radix/ui/button"
import { IconPlaceholder } from "@/preview/icon-placeholder"

export function TeamChat() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>#design-system</CardTitle>
        <CardDescription>Maya, Jordan and 6 others</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Start a call">
            <IconPlaceholder lucide="PhoneIcon" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <MessageGroup className="gap-5">
          <Marker variant="separator">
            <MarkerContent>Today</MarkerContent>
          </Marker>
          <Message>
            <MessageAvatar>
              <Avatar className="size-8">
                <AvatarFallback>MK</AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              <MessageHeader>Maya · 9:32</MessageHeader>
              <BubbleGroup>
                <Bubble variant="secondary">
                  <BubbleContent>The elevation tokens are in the theme now.</BubbleContent>
                </Bubble>
                <Bubble variant="secondary">
                  <BubbleContent>
                    Cards use raised, menus use floating. Can you check dark mode?
                  </BubbleContent>
                  <BubbleReactions role="img" aria-label="Reactions: eyes, thumbs up">
                    <span>👀</span>
                    <span>👍</span>
                  </BubbleReactions>
                </Bubble>
              </BubbleGroup>
            </MessageContent>
          </Message>
          <Message align="end">
            <MessageContent>
              <Bubble align="end">
                <BubbleContent>On it. Shadows are a bit faint on the dark surfaces.</BubbleContent>
              </Bubble>
              <Attachment className="w-56">
                <AttachmentMedia>
                  <IconPlaceholder lucide="FileImageIcon" />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>dark-mode-cards.png</AttachmentTitle>
                  <AttachmentDescription>PNG · 840 KB</AttachmentDescription>
                </AttachmentContent>
              </Attachment>
              <MessageFooter>Read 9:41</MessageFooter>
            </MessageContent>
          </Message>
        </MessageGroup>
      </CardContent>
      <CardFooter>
        <InputGroup>
          <InputGroupInput placeholder="Message #design-system" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Send message">
              <IconPlaceholder lucide="SendHorizontalIcon" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </CardFooter>
    </Card>
  )
}
