const random = require('./tools/random.js');

function randomizeDice(input) {
    const diceRollPattern = /(\d+)[dr](\d+)/g;
    let rollsDetails = []; // 各ダイスの情報を保存する配列

    // ダイスの結果を計算し、表示用の文字列を生成
    const resultExpression = input.replace(diceRollPattern, (match, numDice, numSides) => {
        let rolls = [];
        let total = 0;
        for (let i = 0; i < Number(numDice); i++) {
            let roll = random(1, Number(numSides));
            rolls.push(roll); // 各ダイスの結果を保存
            console.log(roll);
            total += roll;
        }
        rollsDetails.push({ total: total, rolls: rolls }); // 合計と個別の結果を保存
        return total; // 合計値を返す
    });
  
    // rollsDetailsを指定された形式に変形
    const formattedRollsDetails = rollsDetails.map(detail => `${detail.total}[${detail.rolls.join(',')}]`).join('+');
    // 入力全体からダイスの部分を取り除き、残りの部分を取得
    const middleResult = input.replace(diceRollPattern, '').replace(/\s+/g, ' ').trim(); // 一致しない部分を取出す
    return { resultExpression, formattedRollsDetails, middleResult }; // 結果と整形された詳細をオブジェクトで返す
}

function calculate(expression) {
    const zeroDivisionPattern = /\/\s*0/;
    if (zeroDivisionPattern.test(expression)) {
        return 'ゼロ除算が含まれています';
    }

    try {
        const result = eval(expression);
        return result;
    } catch (error) {
        console.error('計算エラー:', error);
        return '計算にエラーが発生しました';
    }
}

function calculateDiceRoll(inputs) {
    const results = inputs.map(input => {
        const { resultExpression, formattedRollsDetails, middleResult } = randomizeDice(input);
        console.log(resultExpression);
        const result = calculate(resultExpression);

        console.log(`ダイスの振った結果: ${formattedRollsDetails}`);
        console.log(`途中結果 (MiddleResult): ${middleResult}`); // 途中結果を表示

        return `${input} -> ${formattedRollsDetails + middleResult} => ${result}`;
    });

    return results; // 結果の配列を返す
}

module.export = randomizeDice;
module.exports = calculate;
module.exports = calculateDiceRoll;