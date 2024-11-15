//  function ini sudah di gabung ke dalam calculateFuzzyScore
function levDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate Levenshtein distance
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

//  function ini sudah di gabung ke dalam calculateFuzzyScore
export function fuzzySearch(query, targets, threshold) {
  const results = [];

  for (const target of targets) {
    const categoryDistance = levDistance(
      query.category.toString(),
      target.category.toString(),
    );
    const codeDistance = levDistance(
      query.code.toLowerCase(),
      target.code.toLowerCase(),
    );
    const totalDistance = categoryDistance + codeDistance;

    if (totalDistance <= threshold) {
      results.push({ ...target, score: totalDistance });
    }
  }

  return results;
}

// prettier-ignore
export function adjustScores(
  _resultFuzzy, // ini adalah data yang akan di scan dan di tampilkan
  softSkillsScore,
  hardSkillsScore,
  totalGrade, // total jumlah nilai ( misal A B C D E yaitu ada 5)
  addtPerc,
) {
  // prettier-ignore
  function calculateImpact(quality, additionalImpactPercentage) {
    if (quality >= 1 && quality <= 2.5) {
      return 0.5 * additionalImpactPercentage; // Efek negatif 40% untuk nilai rendah
    } else if (quality > 2.5 && quality <= 5) {
      return 0.25 * additionalImpactPercentage; // Efek negatif 20% untuk nilai sedang
    } else if (quality > 5 && quality <= 7.5) {
      return -0.25 * additionalImpactPercentage; // Efek positif 20% untuk nilai sedang
    } else if (quality > 7.5 && quality <= 10) {
      return -0.5 * additionalImpactPercentage; // Efek positif 40% untuk nilai tinggi
    } else {
      return 0; // Kembalikan dampak default atau atasi nilai di luar rentang secara sesuai
    }
  }

  const additionalImpactPercentage = totalGrade * addtPerc;
  _resultFuzzy.forEach((item) => {
    const softSkillsImpact = calculateImpact(
      softSkillsScore,
      additionalImpactPercentage,
    );
    const hardSkillsImpact = calculateImpact(
      hardSkillsScore,
      additionalImpactPercentage,
    );

    const totalAddt = softSkillsImpact + hardSkillsImpact;

    item.score -= totalAddt;
    item.score = parseFloat(item.score.toFixed(2));

    // Score kemungkinan bisa lebih dari 5 karena Efek Adjust
    // Lihat di calculateImpact

    // if (item.score < 0) {
    //   item.score = 0.3;
    // }
  });

  return _resultFuzzy;
}

// prettier-ignore
export function konversiNilai(nilai) {
  if (nilai >= 4.5) {
    return "A"; // Skor antara 4.5 dan 5
  } else if (nilai >= 3.5) {
    return "B+"; // Skor antara 3.5 dan 4.49
  } else if (nilai >= 2.5) {
    return "B"; // Skor antara 2.5 dan 3.49
  } else if (nilai >= 1.5) {
    return "C+"; // Skor antara 1.5 dan 2.49
  } else {
    return "C"; // Skor di bawah 1.5
  }
}

// Fungsi untuk menghitung skor fuzzy
export const calculateFuzzyScore = (dataMataKuliah, query) => {
  let score = 0;

  // Bobot skor untuk kategori
  const categoryWeights = {
    1: 5, // Skor penuh jika kategori cocok
    2: 3, // Skor tambahan untuk kategori 3 jika tidak cocok
    3: 2, // Skor tambahan untuk kategori 2 jika tidak cocok
    4: 1, // Skor tambahan untuk kategori 1 jika tidak cocok
  };

  // Bobot skor untuk kode
  const codeWeight = 2; // Skor maksimal untuk kecocokan kode

  // Cek kecocokan kategori dan beri skor atau bonus
  if (dataMataKuliah.category === query.category) {
    score += categoryWeights[1]; // Kategori cocok, beri skor penuh
  } else {
    // Kategori tidak cocok, beri bonus tergantung kategori yang berbeda
    const diff = Math.abs(dataMataKuliah.category - query.category);
    score += categoryWeights[diff] || 0; // Gunakan skor tambahan sesuai perbedaan kategori
  }
  {
    /*
    Jadi jika  dataMataKuliah category === query category score otomatis 5
    Jadi jika  dataMataKuliah category !== query category score menggunakan diff (misal data.category - query.category)
    */
  }

  // Jika kategori cocok, periksa kode
  if (dataMataKuliah.category === query.category) {
    const levenshteinDistance = (a, b) => {
      let tmp;
      let i, j;
      const alen = a.length;
      const blen = b.length;
      const dp = [];

      if (alen === 0) {
        return blen;
      }
      if (blen === 0) {
        return alen;
      }

      for (i = 0; i <= alen; i++) {
        dp[i] = [i];
      }
      for (j = 0; j <= blen; j++) {
        dp[0][j] = j;
      }

      for (i = 1; i <= alen; i++) {
        for (j = 1; j <= blen; j++) {
          tmp = a[i - 1] === b[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + tmp,
          );
        }
      }

      return dp[alen][blen];
    };

    const maxLen = Math.max(query.code.length, dataMataKuliah.code.length); // jumlah huruf code
    const distance = levenshteinDistance(dataMataKuliah.code, query.code);
    // // console.warn("DISTANCE", distance);
    const codeScore = Math.max(
      0,
      codeWeight - (distance / maxLen) * codeWeight,
    );

    //codeScore  2 - (1/6) * 2

    // // console.warn("CODESCORE", codeScore);
    score += codeScore;
    // // console.warn("SCORE", score);
  }

  // Normalisasi skor agar berada dalam rentang 0-5
  const maxScore = categoryWeights[1] + codeWeight; // Total maksimal jika kategori cocok dan kode sempurna
  // Max score ditentukan dari Total Nilai yaitu A B+ C C+ D , dan total key yang di query ( code
  // dan category)
  // console.warn("MAXSCORE=", maxScore);
  const normalizedScore = (score / maxScore) * 5;
  // console.warn("NORMALIZEDSCORE=", normalizedScore);

  return normalizedScore.toFixed(2);
};
