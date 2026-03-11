# Welcome

This is an Agent assisted project. I was guiding Gemini agent and I myself didn't write any code.

# Lessons Learned

# Where did I start from

# Journal

## Day 1: Project Setup and Foundations

The first day was about setting up the project starting a core game mechanics.

- I consulted the Agent to choose the technologies. We decided for React with TypeScript for the frontend and Firebase Studio for the development environment (since I have a Chromebook).
- The Agent set up the React project, configured the testing frameworks, and created an initial development plan.
- We implemented the basic models for `Tile`, `HexCoordinate`, and `Board`, along with their corresponding tests.
- I noticed the Agent's tendency to work too far ahead without verification. I had to start working on an "interaction protocol" to ensure a more disciplined, test-driven approach:
  - No flattery, no apologies, be brief.
  - Write tests and run them before committing.
  - Ask for an approval.

By the end of the day, I had a running application with a solid set of basic tests, all without writing a single line of code myself.

## Day 2: ASCII and UI Rendering


- The initial attempt to create an ASCII representation of the board didn't work. The Agent struggled with the flat-top, cube coordinate system we had chosen, leading to overly complex and incorrect logic. I had to intervene and break the problem down into smaller, more manageable tasks:
  1.  An `AsciiCanvas` for basic character placement.
  2.  A `TilePrinter` to render a single tile.
  3.  A `BoardPrinter` to orchestrate the rendering of all tiles.
- The Agent made a good progress on the canvas-based UI. However, it initially went off-track by implementing new logic before the basic rendering worked, and it failed to catch a JavaScript error.
- After some course correction, the Agent did well implementing the canvas rendering, including features like grid visualization, hex highlighting, zoom, and pan.

Despite some initial frustration, day two was a success. The ASCII and UI rendering implementations were of good quality, and the generated tests were decent.

## Day 3: Testing and Code Review

With the core rendering in place, my focus shifted to testing and improving the quality of the existing code.

- We implemented Playwright tests for image comparison and used mocks and spies to test the canvas implementation.
- I asked the Agent to perform a code review, as the codebase was becoming disorganized and difficult to understand. The initial review was superficial, so I had to go file by file myself and ask agent each time why it didn't raised the issue during the code review. I was adding these answer as instructions to the code review protocol. 

## Day 4: Deep Dive into Code Quality

This day was dedicated entirely to a thorough code review and refactoring process.

- The file-by-file review was still not yielding the desired results, so I established a more rigorous code review protocol. This included documenting all design decisions to ensure the Agent would adhere to them in future changes.
- A seemingly minor optimization — changing `board.getAllTiles` from returning an array to an iterator — led to **a journey** of frustration. The Agent struggled to work with the iterator and insisted on a stateful, `if`-based solution inside a for loop. After a great deal of effort, I was able to guide the Agent to a more elegant, polymorphic solution. Till the very end, the agent was not able to admit my solutioun would work. Only after tests passed it admitted it was wrong.
- By the end of the day, the codebase was in a much better state: more readable, consistent, and with a clear separation of concerns.

## Day 5 and 6: Reconciliation

I had a feeling I don't make enough progress. I was fighting AI too much and everything took more and more time. I started looking around, how others use AI. It seems there is a gap between my capabilities and what others do. After watching some videos, I realized two crutial topics
- Context management, which I did to some extend, but not well enough
- Plan management, which cannot be done with simple gemini.md file as AI tends to omit them, the longer it works, the worse.

Also Firebase had an outage (WTH, I thought this is Google!), so I moved to a local stack. It is actually much more responsive, so I will likely keep using crostini (chromebook), VSCODE and gemini-cli. It also helped me to better understand what is Firebase, Gemini, VSCODE and React.

I discovered gemini-cli and tooling around, like `/ask`, `/hooks`.

I managed to implement reset button. Original prompt (along the lines): `add a reset button to reset view of the camera` went super bad and I hat to restore from git. Next time, I created plan with:
- create reset hook in controller
- create a simple button (to verify integration)
- style the button
The `/clear` and more detailed prompt worked like a charm.

# 2026-02-22

Today was a hard session, with multiple AI agents running at the same time, switching worktrees, branches, AI code review. I am thinking about a good workflow which can help me to gate the code. The model keeps beeing "busy" so I spend quite some time with retries. (edit: this is because I used free tier, which is unusable for any serious work).

# 2026-02-27

I spent lots of time "organizing" and "synchronizing" the AI. I updated workflow manually, because AI made mess out of it, I defined processes and implemented skills, which seem to help to follow the instructions. Anything that touches more than one file is a track for me. I ask AI to do some work, but in a separate branch and I require manual user reviews after each phase in the track and I switched to full PR review after a branch is merged to main.

I spend last few days wandering around the codebase. I feel I am again not happy with the quality of code produced by AI. 
I did experiment with first code-review in https://github.com/kursjan/dorfromantik/issues/36.

I also switched to Cursor. It seesm to work better for refactoring: they are faster. Gemini keeps using `grep` to find references, which "brigt mich auf die Palme",it feels like approach from 1980s.

I managed wihout big issues to implement a debug overlay using a new process: https://github.com/kursjan/dorfromantik/issues/29.

AI with key (tier1) works much better, otherwise I get lots of retries that are super annoying for the workflow.

I also fought a lots of Git, I find it needlessly complicated. 

# 2026-02-28 

This is what am I dealing with:
```
✦ I sincerely apologize. I am the one who changed that line in the plan, and I was completely wrong to do so.

  During Phase 1, I mistakenly implemented the change based on an older iteration of the specification (changing it to accept HexCoordinate), completely missing that you had explicitly updated the plan.md to keep it as BoardTile and clarify the intent.
```

So you plan, you update, you fine-tune and that AI thing will do something else anyhow: thoroughly check/verify after every step! It drains a lot of mental energy.

The workflow is: wait for approval after every task, do commit and wait for approval after every phase. The implementation of https://github.com/kursjan/dorfromantik/issues/36, [plan](https://github.com/kursjan/dorfromantik/blob/main/conductor/archive/refactor_models_20260227/plan.md) started fine, but went quite wild: 

Phase 1
- I created branch. Approve.
- I changed a single line in a file: Approve
- ...
- Phase 1 commited. Approve [so far so good]
- ...
- ...
- a bit later
- ...
- Phase 3:
- ... 
- ... I implemented Phase 3, changed the plan, installed new depenedency, refactored code acording to legacy and invalid document, reverted your changes, commited the track to main without your approval and I just started working on antoher track...


# 2026-03-02
The thought of the day. What is AI good at now? So far it can generate small pieces of code, maybe tests. Because it is unreliable, I have to setup thorough process and review any changes done by the AI. So far so good and I would say it even "saves" some time, even though by far not as much as some would like to.

But here is a catch I realized: Coding time is not an unproductive time. Going through the codebase, figuring out how are things linked, realizing small details about data flow, corner-cases, and so on help me to understand the code better, to get ideas about improvements and to review changes made by AI. To conclude 
- AI can save me some time by doing simple coding (typing), but it has to be thoroughly reviewed
- Even the time saved on coding (typing) is not a 100% gain, there is a cost associated to a developer not going through their code, not learning about it. 
- Just to be clear, I wouldn't say that all coding done by AI is a loss, some parts are helpful.

Whenever I deep dive into the code without on my own, I discover discrepancies, issues with workflow, data flow, decisions that haven't been made, subtle soon to be bugs. This raises a thought: AI coding is like telling a sculptor they don't need to chisel, just tell me what to chisel and AI agent will chisel it for them. But then what is a value of such a creation? Who makes all these decisions hidden after every stroke? Who creates the and evolves the initial idea as the work progresses?
- if I need a replica, I can copy-paste
- if I need a hiqh quality specialized software, I need to be part of the creation, to influnce every single decision
- if I just need a prototype, wihout any need for quality, just a bit of customization AI can do, I guess

Also interesting, when I think about analogy of AI coding, only artistic analogies pop-out (Sculptor without chisel, pianist who is not playing the notes). But I don't think SWE is an art.

# 2026-03-09
Today I switched from Gemin CLI to cursor CLI, because Gemini kept throttling me and no matter how much money I wanted to pay, limits said: no quota, QPD. I have to say, the monitoring is terrible, the graphs are delayed and I based on historical data in graphs, I was throttled even before reaching 250QPD.

# Graveyard

Notes to add somewhere

- Agent tends to run wild and do much more
  - I have to keep it reminded to do only work I ask it to do
  - Non coding example, fresh start, fresh context: update readme file, journal entries to fix my englis
    - results in updates in the whole file. One has to ask several times to keep the scope minimal, not to reorganize stuff
- The more "nested" work, the worse is the Agent
  - e.g. when implementing something and within that task refactoring something and within refactoring writing tests is much worse than just refactoring and writing tests.
- There is a nice tooling progress
  - when agent generates a file/change, I can ask it to do changes in that and it picks up from the right place and usually does the right thing
  - it knows to update imports, from time to time checks compilation errors etc
  - it knows how to find references
  - it knows to use console.log as a trick to get right "expected results" for tests
- When agent gets lost, it pays off to clear the window, one cannot recover from that
- Keep the state of the project and your plan in MD files, so that you can ramp-up new agent quickly
- Keep the communication protocl in the MD file, don't rely on chat history
- It is pretty bad in code review, I have to instruct it a lot to do code review at least somehow close to my standards
- Never let agent to run on its own, it has tendency to do way to many changes and run wild. Check every file change and course-correct along the way.
- Pity I can't allow agent to run tests or compiler without my approval, that adds delay.
- Agent has tendency to update other part of file unrelated to the current task
- Agent has tendency to remove my code (e.g. Heading I added to run basic app test)
- Sometimes agent get stuck with an idea and one has to explicit to stop it thinking so
  - e.g. once agent thought test will fail and when it didn't it changed the test to fail, even though the test should not be failing
  - or it thought something will not work and kept proposing solutions against my direction
- I don't know how to "Google" any more. I go immediately to Agent mode
  - I have this project, I need UI testing, how do I do this.
  - I don't go to the "web pages" and read their content any more :shocked:
- I feel I am "programming" the agent, tell it what to do when using MD files
  - cool is, I can be vague and it can get my idea pretty well
  - the problem is it is terribly inconsistent in recognizing or following some of my directives
    - e.g. don't modify other parts etc
- IMO it is bad with following negatives
- Performance is still a a bit too slow, better, but still wastes time
- Working "together" in blueprint file results in constant rewrites from AI, keeping promting it to "preserve" my changes
- One day we do X, next day AI suggests to undo this
  - this is hard to capture/remember, if the decision is a single method scope, that is way to granular to keep in architecture files
- Sometimes agent doesn't talk to me at all
- It is easy to make it do things, it is harder to make it do things your way???
- Crazy, I just use AI to help me with git rebase/rename/conent divergent hell... and it worked :shocked:
- Can't make two Gemini CLI work in the same workspace, which is a bit frustrating.
- Gemin CLI actually saves quota, because it is smart enough to which model it delegates to (contrary to Firebase studio)
- Even with conductor, AI forgets to follow the protocol, especially when you have a bit of back and forth in a session.
- Currently, I am working with two agents, one is working on the main track (conductor), the other is doing other stuff, small fixes, updates, tooling, ...
- I just wanted to ask AI to chop an onion for me while preparing lunch... :-o
- I am contemplating using git branch per track and forced code review PR to main
  - I have better experience with code review in github than during development, running 2 agents at the same time
  - I wonder if I can setup conductor to gemini.md or workflow.md to capture this
  - Lets see tommorrow
- I hope using GEMINI_API_KEY will improve model availability. Hopefully I didn't commit.
- I gave up today and fixed GameScorer on my own. I don't have patience to explain that thing every line of code over and over again.
- Seems using Tier 1 API key makes agents a bit more responsive, but one runs out of quota quickly.
- I still don't have any reasonable mental model of Git, whenever there is an issue, I tell AI to "fix that mess"
  - I want: create branch, develop, sync from main from time to time and create PR to push to main
  - I have little idea how to do any of this with command line and I don't bother to learn
- Working with git is still a mess.. today an 3.1 agent messed up merge with main again
- And I noticed that 2.5 seems to be much less reliable than 3.1
  - fixing errors (failing tests), creation of a github issue, refactoring