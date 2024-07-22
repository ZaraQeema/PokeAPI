const typeTranslations = {
    normal: "ノーマル", fire: "ほのお", water: "みず", electric: "でんき", grass: "くさ", ice: "こおり",
    fighting: "かくとう", poison: "どく", ground: "じめん", flying: "ひこう", psychic: "エスパー", bug: "むし",
    rock: "いわ", ghost: "ゴースト", dragon: "ドラゴン", dark: "あく", steel: "はがね", fairy: "フェアリー"
};

async function searchPokemon() {
    const input = document.getElementById('pokemonInput').value.toLowerCase();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '読み込み中...';

    try {
        let pokemonData;
        if (!isNaN(input)) {
            // 図鑑番号で検索
            pokemonData = await fetchPokemonData(`https://pokeapi.co/api/v2/pokemon/${input}`);
        } else {
            // 日本語名で検索
            const speciesResponse = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1000');
            const speciesData = await speciesResponse.json();
            const species = speciesData.results.find(s => 
                s.name === input || 
                (s.names && s.names.some(n => n.language.name === 'ja' && n.name.toLowerCase() === input))
            );
            if (!species) {
                throw new Error('ポケモンが見つかりません。');
            }
            const pokemonResponse = await fetch(species.url);
            const pokemonSpeciesData = await pokemonResponse.json();
            pokemonData = await fetchPokemonData(`https://pokeapi.co/api/v2/pokemon/${pokemonSpeciesData.id}`);
        }

        displayPokemonInfo(pokemonData);
    } catch (error) {
        console.error('エラーの詳細:', error);
        resultDiv.innerHTML = `エラーが発生しました: ${error.message}<br>正しい図鑑番号または日本語名を入力してください。`;
    }
}

async function fetchPokemonData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

async function displayPokemonInfo(data) {
    const resultDiv = document.getElementById('result');
    const speciesResponse = await fetch(data.species.url);
    const speciesData = await speciesResponse.json();

    const japaneseName = speciesData.names.find(name => name.language.name === 'ja')?.name || data.name;
    const types = data.types.map(type => typeTranslations[type.type.name] || type.type.name).join('、');
    const japaneseFlavor = speciesData.flavor_text_entries.find(entry => entry.language.name === 'ja')?.flavor_text.replace(/\n/g, '') || '説明が見つかりません';
    const height = data.height / 10;
    const weight = data.weight / 10;
    const imageUrl = data.sprites.other['official-artwork'].front_default;

    resultDiv.innerHTML = `
        <h2>${japaneseName}</h2>
        <img src="${imageUrl}" alt="${japaneseName}" style="width: 200px; height: auto;">
        <p><strong>タイプ:</strong> ${types}</p>
        <p><strong>図鑑説明:</strong> ${japaneseFlavor}</p>
        <p><strong>高さ:</strong> ${height}m</p>
        <p><strong>重さ:</strong> ${weight}kg</p>
    `;
}