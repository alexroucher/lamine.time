import React from 'react';
import { MessageCircle } from 'lucide-react';

const messages = [
  "Merci pour ton énergie, on avance bien grâce à toi !",
  "Tu as un vrai talent pour simplifier les choses, c'est top.",
  "J'adore la manière dont tu abordes les problèmes, ça inspire.",
  "C'est toujours agréable de bosser avec quelqu'un d'aussi motivé.",
  "Ton humour et ta bonne humeur font vraiment la différence.",
  "T'as géré ça comme un(e) pro, bravo !",
  "Tes idées sont vraiment chouettes, elles boostent le projet.",
  "Merci d'être toujours là pour donner un coup de main.",
  "On forme une super équipe, et c'est en grande partie grâce à toi.",
  "Tu trouves toujours la petite touche qui améliore tout.",
  "C'est impressionnant de voir comment tu fais avancer les choses.",
  "Travailler avec toi, c'est vraiment fluide, merci pour ça.",
  "Ton point de vue est toujours super pertinent, ça aide beaucoup.",
  "T'as une manière de rendre les choses simples, j'adore.",
  "On peut toujours compter sur toi, et ça fait vraiment plaisir."
];

const MotivationalMessage = () => {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="card bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
      <div className="flex items-start gap-3">
        <MessageCircle className="h-6 w-6 flex-shrink-0 mt-1" />
        <p className="text-lg font-medium leading-relaxed">
          {randomMessage}
        </p>
      </div>
    </div>
  );
};

export default MotivationalMessage;