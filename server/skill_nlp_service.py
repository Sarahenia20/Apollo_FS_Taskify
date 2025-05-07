from fastapi import FastAPI, Request
from pydantic import BaseModel
import spacy

app = FastAPI()
nlp = spacy.load("en_core_web_sm")

# Your skill mapping logic
TOPIC_SKILL_MAP = {
    "frontend": ["React", "JavaScript", "HTML/CSS", "Angular", "Vue.js"],
    "backend": ["Node.js", "Express", "Python", "Java", "MongoDB", "SQL"],
    "fullstack": ["React", "Node.js", "MongoDB", "JavaScript"],
    "mobile": ["React Native", "Flutter", "Swift", "Kotlin"],
    "cloud": ["AWS", "Azure", "Google Cloud"],
    "devops": ["Docker", "Kubernetes", "Git", "CI/CD", "Terraform"],
    "ui": ["UI/UX Design", "HTML/CSS", "Figma"],
    "ai": ["Machine Learning", "Data Science", "TensorFlow", "PyTorch"],
}

class Description(BaseModel):
    description: str

@app.post("/predict-skills")
def predict_skills(payload: Description):
    doc = nlp(payload.description.lower())
    extracted = set()

    for topic, skills in TOPIC_SKILL_MAP.items():
        if topic in doc.text:
            extracted.update(skills)
    
    return {"skills": list(extracted)}