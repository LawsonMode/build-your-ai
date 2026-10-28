# Privacy & memory

The part of AI setup people skip — and the one that matters most once you use an
assistant regularly. This explains the memory model the builder uses and why the
defaults are set the way they are.

## Why memory needs boundaries

A helpful assistant remembers things so you don't repeat yourself. But "remembers
things" and "quietly builds a permanent file on you and the people in your life"
are the same feature pointed in different directions. The goal isn't to switch
memory off — it's to decide, on purpose, what it's allowed to keep.

## The three tiers

The builder splits everything into three buckets:

### 1. May remember (green light)
Stable, low-risk facts that make the assistant more useful and that you'd happily
repeat anyway:
- Communication preferences (how you like answers)
- Regular tools and software
- Long-term goals
- Recurring projects
- General professional background

These rarely change and reveal little. Leaving them on is what makes an assistant
feel like it "knows" you.

### 2. Ask before remembering (yellow light)
Anything personal. The assistant may use it in the moment, but shouldn't file it
away without checking:
- Personal information
- Family information
- Health-related information
- Financial information
- Information about other people

The point of the "ask first" tier is consent. You might *want* it to remember your
kid's name for a birthday-planning chat — but that should be your call, said out
loud, not a default.

### 3. Never store (red light)
Things that should never persist, full stop:
- Passwords or account numbers
- Confidential records
- Student, client, patient, or employee identifying information

If you handle other people's data for work — teaching, healthcare, law, HR — this
tier is doing real work for you. **Keep it on.** An assistant that never stores a
student's name can't leak one.

## An honest limitation

These instructions are a *request*, not a technical guarantee. You're telling the
model how to behave, and modern assistants follow it well — but the profile isn't
a firewall. So the red-light tier is written as an absolute rule ("never store"),
and the genuinely sensitive stuff (passwords, records, other people's identifying
data) should simply never be typed into a general assistant in the first place.

## How each platform handles memory

- **ChatGPT** — has an explicit Memory feature you can view, edit, and clear in
  Settings. Your profile's rules guide what it saves there.
- **Claude** — can remember across chats. Settings → Your Claude → Your memory →
  Manage shows and edits what it has kept; you can turn memory from chats off,
  or use an incognito chat for anything you want left out. More in
  [Setting up Claude](claude-guide.md).
- **Gemini** — "Saved info" holds persistent facts; your Gem instructions steer it.
- **Copilot** — consumer versions retain less across sessions, so the "conversation
  starter" export re-establishes your preferences each chat.

When in doubt, review your assistant's memory settings directly every so often and
delete anything that drifted in that shouldn't be there.

## The one-line version

Green light for how-you-work. Yellow light (ask first) for anything personal. Red
light for secrets and other people's data — and don't paste those anywhere anyway.
