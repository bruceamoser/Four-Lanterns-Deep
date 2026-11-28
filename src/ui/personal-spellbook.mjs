import { BOOKS } from "../core/study-books.mjs";
import { ROMAN } from "../core/linear-atlas.mjs";
import { esc, icon } from "./icons.mjs";

export function personalSpellbook(
  host,
  { game, index, activate, train, attempt, selected, onSelect },
) {
  const hero = game.party[index],
    library = hero.preview.forge.spellbook;
  const studied = Object.keys(library).map((id) =>
    BOOKS.find((b) => b.id === id),
  );
  const book = studied.find((b) => b.id === selected) ?? studied[0];
  host.innerHTML =
    '<section class="personal-book"><header class="section-heading"><div><small class="eyebrow">' +
    esc(hero.name) +
    "</small><h3>Personal spellbook</h3></div><b>" +
    hero.sp +
    " / " +
    hero.preview.summary.maximumSp +
    " SP</b></header>" +
    (book
      ? '<nav class="filter-tabs" aria-label="Studied books">' +
        studied
          .map(
            (b) =>
              '<button data-source="' +
              b.id +
              '" aria-pressed="' +
              (book === b) +
              '">' +
              esc(b.id[0].toUpperCase() + b.id.slice(1)) +
              "</button>",
          )
          .join("") +
        "</nav><h3>" +
        esc(book.title) +
        '</h3><div class="book-leaves">' +
        library[book.id]
          .map((id) => {
            const p = game.powerSpec(id, hero),
              why = game.actionReason(id, hero),
              pinned = hero.favorites.includes(id);
            return (
              '<article class="study-page"><span>' +
              p.spCost +
              ' SP</span><small class="eyebrow">SECTION ' +
              ROMAN[p.section - 1] +
              " · PAGE " +
              p.page +
              "</small><h4>" +
              esc(p.name) +
              "</h4><p>" +
              esc(p.description) +
              '</p><button data-cast="' +
              id +
              '" ' +
              (why ? "disabled" : "") +
              '>Cast</button> <button data-pin="' +
              id +
              '" aria-pressed="' +
              pinned +
              '" aria-label="' +
              (pinned ? "Unpin " : "Pin ") +
              esc(p.name) +
              '">' +
              icon("star") +
              (pinned ? "Pinned" : "Pin") +
              "</button>" +
              (why
                ? '<small class="cost-note"> ' + esc(why) + "</small>"
                : "") +
              "</article>"
            );
          })
          .join("") +
        "</div>"
      : "<p>This book is empty. Studying a spellbook section in the Atlas adds all its spells here.</p>") +
    "<footer><button data-book-atlas>Open discipline atlas</button></footer></section>";
  host
    .querySelectorAll("[data-source]")
    .forEach((b) => (b.onclick = () => onSelect(b.dataset.source)));
  host
    .querySelectorAll("[data-cast]")
    .forEach((b) => (b.onclick = () => activate(b.dataset.cast, index)));
  host.querySelectorAll("[data-pin]").forEach(
    (b) =>
      (b.onclick = () =>
        attempt(() => {
          game.favorite(index, b.dataset.pin);
          onSelect(book.id);
        })),
  );
  host.querySelector("[data-book-atlas]").onclick = () => train(index);
}
