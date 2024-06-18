/*
* Francis Corona & Ian Stewart
* Social Network - Final Project
*/

export async function aiquery(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
        {
            headers: { "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
						"Content-Type": "application/json"
					},
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result[0].generated_text;
}