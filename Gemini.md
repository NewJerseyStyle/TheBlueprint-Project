# Vision: Non-linear Project Management as Monte Carlo Tree Search

## Project Goal
To transform project management from a linear task list into a non-linear exploration of possible futures, guided by AI and historical data.

## Key Concepts
- **Nodes as States:** Each node represents a project state (Draft, Doing, Decision, Question, etc.).
- **Edges as Transitions:** Edges represent the flow of actions.
- **MCTS Approach:** Using historical data and AI to suggest the "next most likely successful action" for a given project context.
- **Non-Technical Focus:** Designing the UI to guide users who have no formal project management training.

## Upcoming Changes
1.  **Enhanced Node Creation:** Replace the simple "Add Node" action with a "Suggest Next Step" interface.
2.  **Suggestion Engine (Mock):** Implement a system that provides multiple possible next nodes based on the parent node's type and content.
3.  **UI/UX Improvements:**
    - Use visual cues (e.g., highlighting, animations) to guide user attention to suggested actions.
    - Improved interaction for drawing new paths.
4.  **Collaboration Features:**
    - Enhance commenting and discussion within nodes.
    - Add "Tips" or "Actions" to guide users on how to coordinate (e.g., "Give credit to David").

## Technical Strategy
- **Canvas Store:** Update state to support "Suggestion" nodes that aren't yet committed to the canvas.
- **Strategic Node Component:** Update to show suggested paths or a menu of options when extending.
- **Intelligence Panel:** Better integration with the canvas to show "Suggested Paths" for the entire project.
