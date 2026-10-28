# Setting up Claude with your profile

Build Your AI works with any assistant, but it's made with Claude in mind. Claude
gives you several places to put instructions, and the builder makes a version
for each one. This page explains which to use and where it goes.

> Menu names change as apps update. These were checked on 2026-10-28. If a label
> doesn't match what you see, look for the closest thing in Claude's Settings.

## Which version do I want?

| You want… | Use this export | Where it goes |
|---|---|---|
| Claude to act this way in **every chat** | **Claude: all chats** | Settings → Your Claude → Instructions |
| A different setup for **one class, job, or hobby** | **Claude: a Project** | A Project's instructions |
| To say "go into Critic Mode" and have Claude **switch modes** | **Claude: task-mode Skill** | Customize → Skills (upload the .zip) |
| Claude to work this way **while coding** | **Claude Code: CLAUDE.md** | `~/.claude/CLAUDE.md`, or a project folder |

Most people only need the first one. Start there, use it for a week, then add
the others if you want them.

## Claude: all chats

This is the everyday version. It covers who you are (if you filled in *About
you*), the role and personality you picked, how you want answers, the modes you
chose, and your memory rules.

1. In Claude, open **Settings → Your Claude**.
2. Paste into **Instructions**. (On older layouts this is under **Settings →
   Profile**.)
3. Start a new chat. Instructions apply to new chats, not ones already open.

## Claude: a Project

Projects keep a set of chats, files, and instructions together. Good for
anything with its own context: a course you teach, a client, a novel.

1. Open or create a Project.
2. Find its instructions box and paste the Project version in.

The Project version is longer and wrapped in tags like `<role>` and
`<communication_style>`. Claude reads those tags as section labels, which helps it
keep a long set of instructions straight. You don't need to change them.

Project instructions sit on top of your all-chats instructions. If the two
disagree, say which wins (for example, "In this project, ignore my usual
preference for short answers").

## Claude: task-mode Skill

A Skill is a small package of instructions Claude loads only when it's relevant.
The builder turns your chosen task modes (Brainstorm, Critic, Teacher…) into a
Skill, with a few working rules for each mode.

1. On the Export step, choose **Claude: task-mode Skill** and click **Download
   Skill (.zip)**.
2. In Claude, open **Customize → Skills** and upload the .zip.
3. Make sure the Skill's switch is on.
4. In any chat, say "go into Critic Mode."

This step is optional. Your modes are already listed in the other Claude
versions; the Skill just gives Claude more detail about each one. Skills may
not be available on every plan, and on Team or Enterprise plans an admin
may need to allow them.

## Claude Code: CLAUDE.md

Claude Code reads a file called `CLAUDE.md` for instructions.

- Save it as `~/.claude/CLAUDE.md` to use it in every project.
- Save it in a project's folder to use it only there.

This version leaves out the memory tiers and instead tells Claude never to write
your "never store" items into files, commits, or logs.

## Memory in Claude

Claude can remember things across chats. Your profile's memory rules tell it
what's fine to keep, what to ask about first, and what never to store. The
controls themselves are in **Settings → Your Claude**:

- **Your memory → Manage** shows what Claude has saved, and lets you edit or
  delete it.
- **Memory from chats** turns memory on or off.
- **Search and reference chats** controls whether Claude can look back at past
  conversations.
- To keep one conversation out of memory entirely, start it as an incognito
  chat.

The profile is a request, not a lock. Check **Manage** now and then and delete
anything that shouldn't be there. See [Privacy & memory](privacy-and-memory.md)
for why the defaults are set the way they are.

## Using the Claude API

If you're building something with the Claude API, the **Any AI (system prompt)**
export works as a starting system prompt. The Project version also works well
there, because Claude handles the tagged sections nicely.
