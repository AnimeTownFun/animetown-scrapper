import config from "../../config";
import axios from "axios";
import express, { Request, Response } from "express";
import { load } from "cheerio";

const v1Router = express.Router();

let baseUrl = config?.GogoAnimeURL;

v1Router.get("/popular/:page", async (req: Request, res: Response) => {
  let results: any = [];
  let page = req.params.page as string;
  if (isNaN(parseInt(page))) {
    return res.status(404).json({ results });
  }

  let url = `${baseUrl}popular.html?page=${page.toString() as string}`;
  const response = await axios.get(url);
  if (response?.data) {
    try {
      let $ = load(response?.data);
      $(".img").each(function (index, element) {
        let title = $(this)?.children("a")?.attr("title");
        let href = $(this)?.children("a")?.attr("href");
        let id = href?.slice(10);
        let image = $(this)?.children("a")?.children("img")?.attr("src");

        results[index] = { title, id, image };
      });
      res.status(200).json({ results });
    } catch (err: any) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Something went wrong. Try again later " });
    }
  }
});

v1Router.get("/details/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const siteUrl = `${baseUrl}category/${id}`;
    const response = await axios.get(siteUrl);
    const $ = load(response?.data);

    let type = "";
    let summary = "";
    let released = "";
    let status = "";
    let genres = "";
    let otherName = "";

    const title = $(".anime_info_body_bg h1").text();
    const image = $(".anime_info_body_bg img").attr("src");

    $("p.type").each(function (index, element) {
      const spanText = $(this).children("span").text();
      const text = $(this).text();

      if (spanText === "Type: ") {
        type = text.slice(15, -5);
      } else if (spanText === "Plot Summary: ") {
        summary = text.slice(14);
      } else if (spanText === "Released: ") {
        released = text.slice(10);
      } else if (spanText === "Status: ") {
        status = text.slice(8);
      } else if (spanText === "Genre: ") {
        genres = text.slice(20, -4).replace(/ /g, "");
      } else if (spanText === "Other name: ") {
        otherName = text.slice(12);
      }
    });

    const el = $("#episode_page");
    const ep_start = 0;
    const ep_end = el.children().last().find("a").attr("ep_end");
    const movie_id = $("#movie_id").attr("value");
    const alias = $("#alias_anime").attr("value");
    const epList: { id: string; number: string }[] = [];

    const episodeResponse = await axios.get(
      `https://ajax.gogo-load.com/ajax/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`
    );
    const $$ = load(episodeResponse.data);

    $$(" #episode_related > li").each((i, elem) => {
      epList.push({
        id: $(elem).find("a").attr("href")!.split("/")[1],
        number: $(elem).find("div.name").text(),
      });
    });

    const totalepisode = $("#episode_page")
      .children("li")
      .last()
      .children("a")
      .attr("ep_end");

    const results = [
      {
        title,
        image,
        type,
        summary,
        epList,
        released,
        genres,
        status,
        totalepisode,
        otherName,
      },
    ];

    res.status(200).json({ results });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later " });
  }
});

v1Router.get("/search/:word/:page", async (req: Request, res: Response) => {
  const results: any[] = [];
  const word = req.params.word;
  const page = parseInt(req.params.page, 10);

  if (isNaN(page)) {
    return res.status(400).json({ results });
  }

  const url = `${baseUrl}/search.html?keyword=${word}&page=${page}`;

  try {
    const response = await axios.get(url);
    const html = response?.data;
    const $ = load(html);

    $("div.last_episodes ul.items li").each(function (index, element) {
      const title = $(this)?.find("div.img a")?.attr("title");
      const href = $(this)?.find("div.img a")?.attr("href");
      const id = href?.slice(10);
      const image = $(this)?.find("div.img a img")?.attr("src");
      let released = $(this)?.find("p.released")?.text();

      if (released === "") {
        released = "Date not updated";
      }

      results[index] = { title, id, image, released };
    });

    res.status(200).json({ results });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
});

export default v1Router;
