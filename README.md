# SRM Full Stack Challenge - BFHL Test

Hi! This is my project for the BFHL challenge. I built a Node.js backend and a React frontend to handle node hierarchies and cycles.

## My Approach (How I did it)

I tried to keep the logic simple and followed these steps:

1.  **Cleaning the Data**: First, I take the input array and trim any extra spaces. I use a **Regex** to check if the format is exactly `A->B`. If it's wrong, like `hello` or `A->`, I put it in the `invalid_entries` list.
2.  **Mapping Parents and Children**: I use two maps (`parentOf` and `childrenOf`) to track how nodes are connected. 
    -   **Multi-parent check**: If a node already has a parent, I ignore the new one (first parent wins!).
    -   **Duplicates**: I use a Set to track edges I've already seen so I can report them in `duplicate_edges`.
3.  **Building Trees**: 
    -   I find all the **Roots** (nodes that aren't anyone's child).
    -   Then I use a recursive function to build the nested JSON tree and calculate the **Depth** of each tree.
4.  **Finding Cycles**: 
    -   Any node left over after processing the trees must be in a cycle.
    -   I use a BFS search to group these nodes into components.
    -   I pick the alphabetically smallest letter to be the "root" for these cyclic groups.
5.  **Summary Logic**: I just count the trees and cycles and find which root had the biggest depth.


## Tech Stack
-   **Backend**: Node.js, Express, CORS
-   **Frontend**: React (Vite), Vanilla CSS
-   **Deployment**: Dockerized for easy hosting.