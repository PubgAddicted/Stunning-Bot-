import discord
import asyncio
import re
from discord import Game





BOT_OWNER_ROLE = "ADI_ROLE"
lock = asyncio.Lock()

answer_scores = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0
}
answer_scores_last = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0
}

oot_channel_id_list = [
    "ADI_CHANNELIDS", "CHANNEL_IDS"

]

apgscore = 150
nomarkscore = 80
markscore = 40
wentscore = 60

async def update_scores(content):
    global answer
    global answer_scores
    global answer_scores_last


    async with lock:
        if content == "1":
            answer_scores["1"] += nomarkscore
        elif content == "2":
            answer_scores["2"] += nomarkscore
        elif content == "3":
            answer_scores["3"] += nomarkscore
        elif content == "4":
            answer_scores["4"] += nomarkscore
        elif content.startswith("1?") or content.startswith("1apg?"):
            answer_scores["1"] += markscore
        elif content.startswith("2?") or content.startswith("2apg?"):
            answer_scores["2"] += markscore
        elif content.startswith("3?") or content.startswith("3apg?"):
            answer_scores["3"] += markscore
        elif content.startswith("4?") or content.startswith("4apg?"):
            answer_scores["4"] += markscore
        elif content == "1apg":
            answer_scores["1"] += apgscore
        elif content == "2apg":
            answer_scores["2"] += apgscore
        elif content == "3apg":
            answer_scores["3"] += apgscore
        elif content == "4apg":
            answer_scores["4"] += apgscore
        elif content == "1cnf":
            answer_scores["1"] += apgscore
        elif content == "2cnf":
            answer_scores["2"] += apgscore
        elif content == "3cnf":
            answer_scores["3"] += apgscore
        elif content == "4cnf":
            answer_scores["4"] += apgscore
        elif content.startswith("not1?") or content.startswith("n1?"):
            answer_scores["1"] -= markscore
        elif content.startswith("not2?") or content.startswith("n2?"):
            answer_scores["2"] -= markscore
        elif content.startswith("not3?") or content.startswith("n3?"):
            answer_scores["3"] -= markscore
        elif content.startswith("not4?") or content.startswith("n4?"):
            answer_scores["4"] -= markscore
       
       
        else:
          return
        allanswers = answer_scores.values()
        highest = max(allanswers)
        answer = list(allanswers).index(highest)+1
        answer_scores_last = answer_scores.copy()

    return True

class SelfBot(discord.Client):

    def __init__(self, main_bot):
        super().__init__()
        if 'update_embeds' in dir(main_bot):
            self.main_bot = main_bot
        else:
            self.main_bot = None

    async def on_ready(self):
        print("======================")
        print("HEY! ADI SIR  READY")
        print("Connected to discord.")
        print("User: " + self.user.name)
        print("ID: " + str(self.user.id))

    async def on_message(self, message):
        global oot_channel_id_list
        if message.guild == None:
            return
        if str(message.channel.id) in oot_channel_id_list:
            content = message.content.lower().replace(' ', '').replace("'", "")
            updated = await update_scores(content)
            if updated and self.main_bot is not None:
                print('selfbot: external score update')
                await self.main_bot.update_embeds()

class Bot(discord.Client):

    def __init__(self):
        super().__init__()
        self.bot_channel_id_list = []
        self.embed_msg = None
        self.embed_channel_id =587117132840566794
    async def clear_results(self):
        global answer
        global answer_scores
        global answer_scores_last

        answer_scores = {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0
        }

        answer_scores_last = answer_scores.copy()
        answer = ""

    async def update_embeds(self):
        global answer
        global answer_scores

        one_check = ""
        two_check = ""
        three_check = ""
        four_check = ""


        if answer == 1:
            one_check = " ?"
        if answer == 2:
            two_check = " ?"
        if answer == 3:
            three_check = " ?"
        if answer == 4:
            four_check = " ?"
        
        self.embed=discord.Embed(title="ADI", description="ADI!", color=0x340cff )
        self.embed.add_field(name="ADI", value=f"{answer_scores['1']}{one_check}", inline=False)
        self.embed.add_field(name="ADI", value=f"{answer_scores['2']}{two_check}", inline=False)
        self.embed.add_field(name="ADI", value=f"{answer_scores['3']}{three_check}", inline=False)
        self.embed.set_footer(text=f"©ADI")

        if self.embed_msg is not None:
            await self.edit_embed(self.embed_msg, self.embed)


    async def on_ready(self):
        activity = discord.Game(name="ADI!")
        await bot.change_presence(status=discord.Status.online, activity=activity)
        print("User: " + bot.user.name)
        print("TNANKS FOR MAKING ME ADI SIR :)")


        await self.clear_results()
        await self.update_embeds()

    async def send_embed(self, channel, embed):
        return await channel.send('', embed=embed)

    async def edit_embed(self, old_embed, new_embed):
        return await old_embed.edit(embed=new_embed)

    async def on_message(self, message):
        global answer
        global answer_scores
        global answer_scores_last

        # if message is private
        if message.author == self.user or message.guild == None:
            return

        if message.content.lower() == "adi":
            if BOT_OWNER_ROLE in [role.name for role in message.author.roles]:
                self.embed_msg = None
                await self.clear_results()
                await self.update_embeds()
                self.embed_msg = \
                    await self.send_embed(message.channel,self.embed)
                self.embed_channel_id = message.channel.id
                print(self.embed_channel_id)

        # process votes
        if message.channel.id == self.embed_channel_id:
            content = message.content.lower().replace(' ', '').replace("'", "")
            updated = await update_scores(content)
            if updated:
                await self.update_embeds()

if __name__ == '__main__':
    bot = Bot()
    selfbot = SelfBot(bot)

    loop = asyncio.get_event_loop()
    task1 = loop.create_task(bot.start("ADI_B0T_TOKEN"))
    task2 = loop.create_task(selfbot.start("ADI_SELF_BOT_TOKEN", bot=False))
    gathered = asyncio.gather(task1, task2, loop=loop)
loop.run_until_complete(gathered)
