import { Dataset } from 'datasets';
import { AutoTokenizer } from '@huggingface/inference';

export class EmotionTrainer {
  constructor() {
    this.data = {
      text: [
        "Je suis tellement heureux aujourd'hui !",
        "J'ai peur de ce qui pourrait arriver.",
        "Je suis en colère contre lui.",
        "Je me sens triste et seul.",
        "Je suis surpris par cette nouvelle.",
        "C'est une journée normale."
      ],
      label: [0, 1, 2, 3, 4, 5],
      emotion: ['joie', 'peur', 'colère', 'tristesse', 'surprise', 'neutre']
    };

    this.emotionMap = {
      0: 'joie',
      1: 'peur',
      2: 'colère',
      3: 'tristesse',
      4: 'surprise',
      5: 'neutre'
    };
  }

  async initialize() {
    try {
      // Créer le dataset
      this.dataset = Dataset.fromDict(this.data);
      this.splitDataset = await this.dataset.trainTestSplit({ testSize: 0.3 });

      // Initialiser le tokenizer
      this.tokenizer = await AutoTokenizer.fromPretrained("camembert-base");

      // Tokenizer les données
      this.tokenizedDataset = await this.splitDataset.map(this.tokenize.bind(this), { batched: true });

      console.log("Initialisation réussie !");
      console.log("Exemple de données tokenisées :", this.tokenizedDataset.train[0]);
      
      return true;
    } catch (error) {
      console.error("Erreur lors de l'initialisation :", error);
      return false;
    }
  }

  tokenize(batch) {
    return this.tokenizer(batch.text, {
      padding: true,
      truncation: true
    });
  }

  async predictEmotion(text) {
    try {
      const tokenized = await this.tokenizer(text, {
        padding: true,
        truncation: true
      });

      // Pour l'instant, nous utilisons une prédiction simple basée sur des mots-clés
      // En attendant d'implémenter le modèle complet
      const emotionalWords = {
        joie: ['heureux', 'content', 'joyeux', 'rire', 'sourire'],
        peur: ['peur', 'effrayé', 'terrifié', 'inquiet'],
        colère: ['colère', 'énervé', 'furieux', 'rage'],
        tristesse: ['triste', 'seul', 'déprimé', 'malheureux'],
        surprise: ['surpris', 'étonné', 'wow', 'incroyable'],
        neutre: ['normal', 'ordinaire', 'habituel']
      };

      for (const [emotion, words] of Object.entries(emotionalWords)) {
        if (words.some(word => text.toLowerCase().includes(word))) {
          return emotion;
        }
      }

      return 'neutre';
    } catch (error) {
      console.error("Erreur lors de la prédiction :", error);
      return 'neutre';
    }
  }
} 