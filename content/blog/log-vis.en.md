---
title: Visualizing Log Data for Fun and Profit
author: Juliette Regimbal
date: 2024-06-03
tags:
    - howto
    - visualization
---

OK, probably not for profit.

Recently, I was conducting a qualitative study that involved participants using a computer program.
I was faced with a problem likely familiar to many in HCI/UX: how do I actually get a sense of the patterns of interaction people have with this software?
Searching on Google did not reveal anything useful, as is so often the case nowadays, so armed with a handful of CSVs of log outputs and a cursory knowledge of matplotlib and pandas, I dove in.

I wanted to show two types of categorical information (e.g., which element a user interacted with and the command issued) over time.
My timestamps were stored in an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format (the best way to format timestamps), but I don't particularly care about the exact moment a command was issued.
The offset in seconds from the start of the program is more relevant:

```python
import pandas as pd

with open("mydata.csv", 'r') as f:
    df = pd.read_csv(f)
start_time = df.iloc[0]["timestamp"] # This will always be start
df["offset"] = df["timestamp"].apply(lambda x: (x - start_time).total_seconds())
```

From there, I first tried to get something nice using seaborn, since seaborn plots are typically far prettier than anything I make myself.
A cursory look through the [categorical data docs](https://seaborn.pydata.org/tutorial/categorical.html) showed that `catplot` would be a good place to start, so I naively took `sns.catplot(data=df, x="offset", y="mode", hue="command") for a spin. For the purposes of this blog, know that x is offset in seconds and y and z are categorical.

![A picture of a plot where many different colored data points are shown. They are large and overlap with each other, so many are hidden](/blog/catplot.png)

That's not quite what I had in mind. I continued playing around with `stripplot` and different marker shapes, but ultimately the same key problem remained: data were getting hidden and it was difficult to tell the order in which events occurred. What's worse, short events could easily be missed entirely if seaborn decided that was more *aesthetic*.
At this point I had to face facts and dive into matplotlib.

What I had in mind initially, and what seaborn failed to easily provide, were horizontal bars of varying colors that corresponded with the different events. Something like what you would see in a web browser debugging interface, and presumably other debugging interfaces.
Since I have spent far too much of my life debugging code, this works well for my brain.
So the first thing I set off to do was create a visualization of which mode the software was in over time, either manual or autonomous.
After the traditional `import matplotlib.pyplot as plt` and a few screens of error messages, I arrived at the following:

```python
fig, ax = plt.subplots()

bottom = pd.Timedelta(0)
for _, row in df_mode.iterrows():
    color = 'tab:blue' if row["Mode"] == "manual" else 'tab:red'
    ax.barh("Mode", row["Duration"].total_seconds(), left=bottom.total_seconds(), color=color)
    bottom += row["Duration"]
ax.set_xlabel("Time (s)")
```

![A plot taken up by one large colored bar labeled "Mode". It is mostly blue, with two lines of red. It looks quite bad.](/blog/mode-bar.png)

This was closer to what I had in mind. There was still no legend (a problem for later on) and it would not earn me points with any designers, but it looked functional enough for my purposes and by this point I wanted to get on with my analysis.

For the problem of Ugly Colors, I set up a dictionary to manually link the different commands to corresponding colors.
I decided to make two types of plots, one where the y-axis was used for the mode, and another where the y-axis indicated which element the user was interacting with.
In either case, I would iterate through the commands and plot as many horizontal bars as occurrences. I manually set `width=1` since this looked alright and avoided the overlapping issue with seaborn.
Finally, I added in some niceties, like labels and a legend so that there was any chance the resulting image would be intelligible to another person.

All together, the code looks something like this:
```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

COMMAND_PALETTE = {
    "create": "tab:green",
    "resize": "tab:purple",
    "move": "tab:gray", #"tab:red",
    "user": "tab:blue",
    "agent": "tab:orange",
    "switch": "tab:brown",
    "guide": "tab:pink",
    "zone": "tab:red", #"tab:gray",
    "lock": "tab:olive",
    "delete": "tab:green",
    "reset": "tab:cyan"
}


# Setup code specific to my format
def setup_df(df):
     # Timestamps as timestamps
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    # Convert string representation of arrays to np.array
    for label in ["create", "delete", "modify", "move"]:
        df.loc[df["command"] == label, "primary"] = df.loc[df["command"] == label, "primary"].apply(
            lambda x: np.array([float(y) for y in x[1:-1].split(',')])
        )

    for label in ["create", "delete", "move"]:
        df.loc[df["command"] == label, "secondary"] = df.loc[df["command"] == label, "secondary"].apply(
            lambda x: np.array([float(y) for y in x[1:-1].split(',')])
        )

    mode = "manual"
    data = []
    data2 = []
    start_time = df.iloc[0]["timestamp"]
    for _, row in df.iterrows():
        if row["command"] == "switch":
            mode = row["primary"]
        data.append(mode)
        data2.append((row["timestamp"] - start_time).total_seconds())
    df["mode"] = pd.Series(data)
    df["offset"] = pd.Series(data2)
    del mode; del data; del data2; del start_time
    df.loc[df["command"] == "modify", "command"] = df.loc[df["command"] == "modify", "secondary"]


def show_mode_plt(df, title=None, ax=None):
    if ax is None:
        fig, ax = plt.subplots()
    df_filt = df[(df["command"] != "start") & (df["command"] != "quit")]
    width = 1
    for key in COMMAND_PALETTE.keys():
        df_filt2 = df_filt[df_filt["command"] == key]
        if len(df_filt2) > 0:
            ax.barh(df_filt2["mode"], width, left=df_filt2["offset"], color=df_filt2["command"].apply(lambda x: COMMAND_PALETTE[x]), label=key)

    #ax.legend()
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Mode")
    if title is not None:
        ax.set_title(title)
    del width; del df_filt2; del df_filt


def show_element_plt(df, title=None, ax = None):
    if ax is None:
        fig, ax = plt.subplots()
    df_elem = df[~np.isnan(df["element"])]
    df_elem = df_elem.astype({"element": "category"})

    width = 1
    for key in COMMAND_PALETTE.keys():
        df_filt2 = df_elem[df_elem["command"] == key]
        if len(df_filt2) > 0:
            ax.barh(df_filt2["element"], width, left=df_filt2["offset"], color=df_filt2["command"].apply(lambda x: COMMAND_PALETTE[x]), label=key)

    #ax.legend()
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Element")
    if title is not None:
        ax.set_title(title)
    del width; del df_filt2; del df_elem


with open("../Data (Anonymized)/Logs/test-1.csv", 'r') as f:
     df_test_data = pd.read_csv(f)
setup_df(df_test_data)
fig, ax = plt.subplots(2, figsize=(16, 12))
show_mode_plt(df_test_data, ax=ax[0])
show_element_plt(df_test_data, ax=ax[1])
fig.suptitle("Test Data")
fig.tight_layout()
ax[0].legend(loc='center left', bbox_to_anchor=(1, 0.5))
ax[1].legend(loc='center left', bbox_to_anchor=(1, 0.5))
fig.savefig("test.png", bbox_inches="tight")
```
Which results in the following visualization:
![Two plots, one over the other. The one on the top shows the mode, autonomous or manual, and has multicolored bars throughout. The one on the bottom lists 20 elements and is very sparse.](/blog/final-vis.png)

This is not a very *quick* script and it certinaly could look nicer, but it was good enough for my purposes, especially since most of my participants didn't come close to making as many elements as in this sample data and I could make a far larger graphic than makes sense for this site.
I could see the efficiency especially becoming a problem for someone dealing with a much larger data set.
Hopefully this can be a good starting point for someone else attempting a similar visualization, if they can't just use the code as is.

And, if you know of a better way to do this, I'd be excited to hear!
