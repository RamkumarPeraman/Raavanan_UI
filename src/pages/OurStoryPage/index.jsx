import React from 'react';

const storyParagraphs = [
  `It began in the humid winds of July 2024, at a modest tea stall in Coimbatore — a spot most would pass by without a thought, but one that became the birthplace of something extraordinary. Four students, drawn together by a silent storm of shared frustrations, sat and debated endlessly. They came from different walks of thought, but one fire bound them: a deep dissatisfaction with the world as it was — educational inequality, social injustice, and the systematic erasure of Tamil history. They had studied communism, read movements, and watched generations fade without change. But they agreed on one crucial thing: they wouldn't take the path of political parties.`,
  `"We don't need positions to stand for the people," one of them said. "We just need people," said another.`,
  `From those conversations emerged the idea — not of an organization, but of a movement. A platform where people of conviction, not power, could come together. Not just to speak, but to act. A fellowship. A network. A fire. And so, Raavana Thalaigal was imagined.`,
  `But imagination alone was not enough. What followed were weeks of tension and months of uncertainty. Even within that original core, ideological clashes emerged — differing views, egos, doubts. That's when a truth was learned: if organizing four minds was this hard, imagine uniting hundreds. But instead of breaking, they matured. They realized that in a real movement, individual thinking isn't the enemy — undisciplined direction is. And from that moment, they began to build structure.`,
  `The name, Raavana Thalaigal, was met with fierce backlash. Whispers turned to rumors: "Are they religious fanatics?" "Are they rebels opposing the government?" "Is this some underground movement?" But they didn't flinch. They weren't interested in arguing who Raavanan was to others — they stood by who he was to Tamils. A symbol of knowledge, skill, and majestic rule. A ten-headed thinker. A Tamil king whose name was vilified in epics but remembered with pride by the wise. They weren't here to convert belief. They were here to reclaim dignity.`,
  `In their eyes, Raavanan was not a debate — he was a mirror to what every Tamil could become: wise, disciplined, multi-skilled, and unshakably proud.`,
  `With that fire in their hearts, the journey continued through failed registration attempts, rejections, and the slow burning of hope. Until February 1, 2025 — the day the legal recognition was granted. That day, they didn't just sign papers. They took an oath — not for power, but for people. To build thrones not for leaders, but for every deserving soul ready to serve. To live and die carrying people forward — not in memory, but in action.`,
  `Today, Raavana Thalaigal Trust isn't just a name. It's a revolution wrapped in discipline, a network built on fire, and a legacy written in rationality. And the founders still believe — maybe it wasn't them who chose this path. Maybe Raavana Thalaigal chose the people who were meant to carry it forward.`,
];

const milestones = [
  { year: 'July 2024', label: 'The Beginning', desc: 'Four students meet at a tea stall in Coimbatore and the idea is born.' },
  { year: 'Aug – Dec 2024', label: 'Building Structure', desc: 'Months of debate, ideological shaping, and drafting the foundation.' },
  { year: 'Feb 1, 2025', label: 'Legal Recognition', desc: 'Raavana Thalaigal Trust is officially registered (Reg. No: 31/25).' },
  { year: 'April 2025', label: 'Vidiyal Drive', desc: 'The first membership drive launches across Tamil Nadu.' },
];

const OurStoryPage = () => {
  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-20">
        <div className="container-custom text-center">
          <p className="text-primary-200 text-sm font-semibold uppercase tracking-widest mb-3">Our Journey</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Rise of Raavana Thalaigal</h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            A story of four students, one fire, and a movement that refused to stay silent.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="container-custom py-16">
        <div className="max-w-3xl mx-auto">
          {storyParagraphs.map((para, i) => (
            <p
              key={i}
              className={`mb-6 leading-relaxed text-gray-700 ${
                i === 1 ? 'italic text-lg text-primary-700 font-medium border-l-4 border-primary-400 pl-5' : 'text-base md:text-lg'
              }`}
            >
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white py-16">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12">Key Milestones</h2>
          <div className="relative max-w-3xl mx-auto">
            {/* vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary-200 hidden md:block"></div>
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm z-10">
                    {i + 1}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 flex-1 shadow-sm border border-gray-100">
                    <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">{m.year}</span>
                    <h3 className="text-lg font-bold text-gray-800 mt-1 mb-1">{m.label}</h3>
                    <p className="text-gray-600 text-sm">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quote / CTA */}
      <div className="bg-primary-700 text-white py-16 text-center">
        <div className="container-custom max-w-2xl">
          <p className="text-2xl md:text-3xl font-bold italic leading-snug mb-6">
            "Maybe it wasn't them who chose this path. Maybe Raavana Thalaigal chose the people who were meant to carry it forward."
          </p>
          <a
            href="/volunteer"
            className="inline-block px-8 py-3 bg-white text-primary-700 font-bold rounded-full hover:bg-primary-50 transition-colors"
          >
            Join the Movement
          </a>
        </div>
      </div>
    </div>
  );
};

export default OurStoryPage;
