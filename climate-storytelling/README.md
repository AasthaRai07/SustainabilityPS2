# Climate Storytelling Platform: Data to Empathy Bridge

An interactive 3D web application that transforms climate data into personalized, emotionally resonant stories.

## Features

- **3D Globe Visualization**: Interactive Earth visualization that responds to climate data
- **Personalized Stories**: AI-generated narratives based on location, timeframe, and interests
- **Real Climate Data**: Integration with NASA Earth Observations API
- **Scrollytelling Experience**: Engaging story progression with visual feedback
- **Multiple Perspectives**: Stories focused on different aspects (hometown, coffee, wildlife, etc.)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Visit `http://localhost:5173`

## How It Works

1. **Select Your Location**: Choose from popular cities or enter your own
2. **Choose Timeframe**: 2030, 2040, or 2050 projections
3. **Pick a Story Focus**: General environment, hometown, coffee, wildlife, etc.
4. **Add Personal Context**: Share what matters most to you about climate change
5. **Experience Your Story**: Read the personalized narrative with 3D visualizations

## Technology Stack

- **Frontend**: React + Vite
- **3D Graphics**: Three.js + React Three Fiber
- **Styling**: Tailwind CSS
- **Data Visualization**: D3.js concepts
- **Animations**: Framer Motion
- **API Integration**: NASA Earthdata API
- **AI Stories**: OpenAI GPT (optional, with API key)

## Development

The application works in mock mode by default, generating realistic climate data and pre-written stories. To enable AI-generated stories:

1. Create an OpenAI API key at https://platform.openai.com/api-keys
2. Create a `.env` file with your key:
   ```
   VITE_OPENAI_API_KEY=your-actual-api-key
   ```

## Project Structure

```
src/
├── components/
│   ├── 3d/           # Three.js components
│   ├── story/        # Story display components
│   └── ui/           # Input components
├── services/         # API services and data processing
├── hooks/            # Custom React hooks
└── utils/            # Utility functions
```

## Contributing

This is a proof-of-concept for climate communication. Contributions welcome for:
- Additional data sources
- More story templates
- Enhanced 3D visualizations
- Mobile optimization
- Accessibility improvements

## Impact Goals

- Combat climate fatigue through personal storytelling
- Bridge the gap between scientific data and public empathy
- Provide educators and journalists with new communication tools
- Inspire meaningful climate action through emotional connection

## License

MIT License - feel free to use and adapt for climate communication projects.