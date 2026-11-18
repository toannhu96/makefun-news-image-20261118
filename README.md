# makefun-news-image-20261118

[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/toannhu96/makefun-news-image-20261118/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![reward](https://make.fun/badge/news-image-20261118/toannhu96/makefun-news-image-20261118/reward.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)

An entry for make.fun's **Sum up 18 November 2026's world news in one image** bounty.

A 1024x1024 poster of seven stories, drawn as panels with a dated masthead.
`main.ts` copies `entry.png` to `/output/entry.png`, rejecting an empty or
over-1 MiB source and verifying the PNG signature after writing.

Run locally:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

MIT licensed.
