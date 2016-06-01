# connect-four
Connect Four webapp with minimaxing AI, uses mostly jQuery and jQueryUI

[Demo available here](https://wustep.github.io/connect-four/)

![connect-four](http://wustep.us/assets/img/portfolio/connectfour.png "connect-four")

# Bitwise solution logic
Solving boards (checking for 4-in-a-rows) uses some neat bitwise logic adapted from [John Tromp](https://tromp.github.io/c4/c4.html). Since Javascript uses 32-bit integers for bitwise operations (bitshift and bitand were required), a function bAnd() (for bitwise and) and Math.pow() are used. This might end up making it slower than simpler for loops but some testing might be done later.

# AI
There's currently 3 playAI functions. Yellow uses playAI1() and red uses playAI3().

1 - Knowledge-based, win move > block move > center > other move > move that lets opponent move on next turn

2 - Essentially the same as 1, but creates scores for each column with evalBoard()

3 - Minimaxing with minimax() and evalBoard2(). It's not perfect yet as the heuristic probably needs improvement

playAI3 will be improved in the future and then made the primary AI for both yellow and red.
