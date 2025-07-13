---
title: Thoughts on Self-Hosting
author: Juliette Regimbal
date: 2025-07-13
tags:
  - "web"
  - "howto"
---

I've hosted a personal Nextcloud server using a VPS for years. I always knew I could *probably* do it myself, but the only spare computer I had to run constantly was an old Raspberry Pi B. The upfront cost of replacing that put the thought of self-hosting it out of my mind up until a couple weeks ago, when I became sick and tired of regular spring cleaning to stay under the storage limit of my VPS. It had also been a good year or so since I took on a real IT project of my own, so curiosity got the best of me. I asked myself:

## Is switching worth the cost?

Or, rather, when would switching to a machine of my own be worth the cost of purchasing and operating it. With my internet bill a fixed expense and the maximum residential rate for electricity in Quebec set at 10.652 ¢/kWh, a new machine would need to consume a constant 130 W to match the monthly cost of my current, insufficient VPS. A better question is how long would it take for the cost of the machine to be recouped, and how much can I expect to save in its usable life?

To begin, I started to price out my options. For the new machines, I primarily looked at different mini PCs with n100 or n150 chipsets, since these have quite low power usage, and used mini PCs with typical i5s, Ryzens, etc. For the VPS, I priced three options:
* my current VPS,
* my current configuration, but with an extra 40 GB of storage, and
* a VPS with specs that roughly matched the computers I was considering in terms of RAM and storage.

I decided to calculate the time in months it would take to recover the costs of the machine, and then the total savings I should have at three years after the date of purchase. Three years was picked as a point in time where if the hardware failed I wouldn't want to feel as if I wasted my money. Ideally, I would continue using the system for years after the fact (my current laptop just had its tenth birthday).

What became clear fairly quickly from plugging in the after-tax cost of the machines and their expected power usage (hard to estimate from public information, I used 6 W for the n100/150s and 35 W for other Intel chips) is that the savings from power efficiency were fairly inconsequential. The cost of the system was the main factor in how long it would take to break even and savings over three years.

From there, I narrowed the scope down to two machines: a used Thinkcentre m910q and a new n150 system from Aliexpress. On paper, the n150 was better, costing a little more up-front, but saving money at a slightly faster rate that would pay off more at the three-year mark. However, I saw some reviews on Reddit about this manufacturer reporting issues with using their mini PCs as servers due to poor cooling. In some cases, this led to components failing.

It might be unlikely, but replacing any components on the n150 system would quickly make it a more expensive option than the m910q. Seeing a good number of people use the m910q in their own home server/lab setups for years at a time, I was comfortable taking it as the safe option.

## Setting up the server

This is largely an aside, but prior to buying the m910q I wanted to get a feel for what my network would look like. I dusted off my old Raspberry Pi, installed debian, and moved this website over to it.

Like most residential internet customers, I do not have a static IP, nor am I willing to pay extra to get one. A coworker mentioned that ddclient works well for dynamically setting A records for nameservers that let you use an API. Luckily, I found a guide to configuring ddclient for my registrar, OVH, and made the switch.

Or, I tried to switch. It turns out, the good people at OVH do **not** offer a dynamic DNS service through their Canadian subsidiary. If you're in Europe, go right ahead. Even more confusingly, they have documentation and a category of support ticket for the service from the Canadian web portal, so I was able to send a request for assistance with a service that is not actually offered.

Anyway, I just switched to different nameservers that will let me update the A records, and it all worked fine. This was just a perplexing experience that I unfortunately doubt OVH will bother doing anything about, and I need to complain about it.

Once the m910q arrived, things went fairly smoothly. I installed Proxmox on the system, configured a subnet for the web servers, and moved everything over. It took a bit of time to adjust my personal CI/CD scripts. After spending a bit of time getting something to work with rsync and SSH, I realized I was overcomplicating it and a webhook would be much easier to manage and let me avoid SSH altogether.

Having Nextcloud run on a much better system has been great. The server responds much more quickly to requests and I'm no longer terrified that if I upload a video of the cat I'll run out of space. It has only been a few days, but the experience thus far is positive.

## Checking my work

I made some pretty huge assumptions about power consumption earlier on, and the thought was nagging me: how close is the 35 W in reality? I have a little plug-in power meter, so as I was thinking about this blog post I measured the energy used by the server over an hour. The total energy used was 0.004 kWh, or 4 W on average.

I clearly was pessimistic on the estimate, and the effect of power consumption on cost is practically nil for my current purposes. Granted, I knew that going in, and wanted to err on the side of caution, but I still expected something greater. I'm realizing my intuition for idle/high-load power consumption is way off, and will probably do some projects measuring energy use in the future to develop this a bit further.

In any case, I am quite happy with how this process turned out, and look forward to having a bit of extra money when this effort literally pays off!
