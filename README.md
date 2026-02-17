# Welcome

This is an Agent assisted project. I was guiding Gemini agent and I myself didn't write any code.

# Lessons Learned

# Where did I start from

# Journal

## Day 1: Project Setup and Foundations

The first day was focused on setting up the project and establishing a baseline for the core game mechanics.

*   **Technology Selection:** I consulted the Agent to choose the appropriate technologies. We settled on React with TypeScript for the frontend and Firebase Studio for the development environment.
*   **Initial Scaffolding:** The Agent set up the React project, configured the testing frameworks, and created an initial development plan.
*   **Core Models:** We successfully implemented the foundational models for `Tile`, `HexCoordinate`, and `Board`, along with their corresponding tests.
*   **Early Observations:** I quickly noticed the Agent's tendency to work too far ahead without verification. This led to the creation of an "interaction protocol" to ensure a more disciplined, test-driven approach:
    *   No flattery, no apologies, be brief.
    *   Write tests and run them before committing.

By the end of the day, I had a running application with a solid set of basic tests, all without writing a single line of code myself.

## Day 2: ASCII and UI Rendering

Day two presented the first significant challenge: visualizing the hexagonal grid.

*   **ASCII Printer:** The initial attempt to create an ASCII representation of the board was problematic. The Agent struggled with the flat-top, cube coordinate system we had chosen, leading to overly complex and incorrect logic. I had to intervene and break the problem down into smaller, more manageable tasks:
    1.  An `AsciiCanvas` for basic character placement.
    2.  A `TilePrinter` to render a single tile.
    3.  A `BoardPrinter` to orchestrate the rendering of all tiles.
*   **UI Rendering:** The Agent made significant progress on the canvas-based UI. However, it initially went off-track by implementing new logic before the basic rendering was functional, and it failed to catch a JavaScript error.
*   **Canvas Success:** After some course correction, the Agent did an excellent job of implementing the canvas rendering, including features like grid visualization, hex highlighting, zoom, and pan.

Despite some initial frustration, day two was a success. The ASCII and UI rendering implementations were of good quality, and the generated tests were decent.

## Day 3: Testing and Code Review

With the core rendering in place, the focus shifted to testing and improving the quality of the existing code.

*   **Advanced Testing:** We implemented Playwright tests for image comparison and used mocks and spies to test the canvas implementation.
*   **Initial Code Review:** I asked the Agent to perform a code review, as the codebase was becoming disorganized and difficult to understand in certain areas. The initial review was superficial, which prompted me to request a more detailed, file-by-file analysis.

## Day 4: Deep Dive into Code Quality

This day was dedicated entirely to a thorough code review and refactoring process.

*   **Establishing a Protocol:** The file-by-file review was still not yielding the desired results, so I established a more rigorous code review protocol. This included documenting all design decisions to ensure the Agent would adhere to them in future changes.
*   **Refactoring Challenges:** A seemingly minor optimization—changing `board.getAllTiles` from returning an array to an iterator—led to a significant amount of friction. The Agent struggled to work with the iterator and insisted on a stateful, `if`-based solution for the ASCII rendering. After a great deal of effort, I was able to guide the Agent to a more elegant, polymorphic solution.
*   **End Result:** By the end of the day, the codebase was in a much better state: more readable, consistent, and with a clear separation of concerns.

While no new features were implemented, the intensive refactoring and code review were crucial for the long-term health of the project.

# Graveyard
Notes to add somewhere

- Agent tends to run wild and do much more
  - I have to keep it reminded to do only work I ask it to do
- The more "nested" work, the worse is the Agent
  - e.g. when implementing something and within that task refactoring something and within refactoring writing tests is much worse than just refactoring and writing tests.
- There is a nice tooling progress
  - when agent generates a file/change, I can ask it to do changes in that and it picks up from the right place and usually does the right thing
  - it knows to update imports, from time to time checks compilation errors etc
  - it knows how to find references
  - it knows to use console.log as a trick to get right "expected results" for tests
- When agent gets lots, it pays off to clear the window, one cannot recover from that
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