Hi Ruby!

Thank you so much for agreeing to work together on an open-source project. I think delphi.tools is super cool and your commitment to free creative tools is very respectable. You also have a really good eye for design; I've been watching the feedback you give others, and me, and it's always spot on.

A little backstory. Our studio, in the process of deciding to make a game, realised we needed a version control system that could handle more than just binary text files. Perforce, CVS, Subversion, and Git were all out for various reasons. I tried building a highly integrated version of Git with better blob support, but it wasn't great. Epic Games announced and released Lore, their VCS, which handled blobs and text identically, and was extremely performant at scale since they built it for Fortnite. Perfect!

It so turns out that we also have another use case where we need blob support in version control: operating system development (gotta make money somehow lol). So now our use cases were stacking up, and we're in the process of developing our Lore distribution, which we'll make public in a few days. It's not crazy, just support for Postgres. As part of that, at some point we want to develop a web UI for it, since currently there is none. However, we have our beautiful design language, Beam, that we want to use.

Admittedly, it's a big project. With that, since you were hating on Git{Hub,Lab}'s UI/UX, for very reasonable issues, I figured I'd propose a shared project. Since building a frontend is a monumental task, and you've expressed interest in potentially working together, I figured the best way might be to split up the work. I am absolutely terrible at frontend UI/UX, and I genuinely don't have any experience in it. But, implementing a Lore frontend is no small feat as it has specific connection requirement, authentication, and all sorts of different complexities. And I am really good at that part: building to spec.

I've attached the API definitions for Lore, it's all protocol buffers, so you can see the general scope, what's available, and the general shape of the data. You mentioned it won't be a quick process, which makes total sense to me, and we're also not on any deadlines. From my perspective, it takes as long as it takes, and we should do it in small increments. Maybe it's readonly of the repositories, first? I would be very open to leaving little design tags in the footer, and having an About page where you talk about the design of the frontend, if you want. We also aren't planning on any design feedback rounds, unless asked for by you, since we're interested in your designs, not our design by you 🫶🏼 As far as which OSF license, our team generally prefers AGPL 3.0 for services, but I am willing to use whatever license you want so long as it's OSF approved.

If this still sounds like an interesting project to work together on, I would love to work together with you. On CC is Lonni Faber, our studios' Head of Production. She's here to help me understand some of the design process, artifacts, and other bits of the project that I would otherwise be unfamiliar with.

Please let me know if you have any questions, or if you would prefer to do something different! I look forward to potentially working together.

Sienna

PS: I will do the implementation in Deno with their Fresh + Preact framework

--

Studio Head & Principal Engineer