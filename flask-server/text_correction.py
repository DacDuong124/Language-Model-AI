import requests
from docx import Document
from urllib.parse import quote, urlencode, urlparse
import time
import os
import shutil
import firebase_admin
from firebase_admin import credentials
from firebase_admin import storage
from firebase_admin import credentials, auth, firestore
from google.cloud import storage

# Configure Firebase Admin SDK
cred = credentials.Certificate("language-ai-model-firebase-adminsdk-l4hgq-1c59e87bd8.json")


def custom_urlencode(params):
    return urlencode(params, quote_via=quote)

def left_whitespaces_counter(string):
    return len(string) - len(str(string).lstrip())

def download_document(url):
    try:
        response = requests.get(url)
        response.raise_for_status()

        # Extracting the filename from the URL
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)

        # Check if the URL contains a valid filename
        if not filename:
            raise ValueError("URL does not contain a valid filename")

        with open(filename, 'wb') as f:
            f.write(response.content)
        return filename  # Return the actual filename used
    except Exception as e:
        print(f"Failed to download document: {e}")
        return None



def correct_document_from_url(document_url, user_id):
    # Download the document and get the filename
    downloaded_filename = download_document(document_url)
    if not downloaded_filename:
        return None  # Exit if the download fails

    # Extract the file extension
    file_extension = os.path.splitext(downloaded_filename)[1].lower()

    # Process the document based on its file type
    if file_extension == '.docx':
        doc = Document(downloaded_filename)
        replace_list = {}

        for paragraph in doc.paragraphs:
            if str(paragraph.text).strip():
                target = paragraph.text.strip()
                answer = call(target)
                if answer:
                    replace_list[target] = answer

        # Apply the replacements to the document
        if replace_list:
            change_sentences(replace_list, downloaded_filename.rstrip(file_extension))
            change_format(downloaded_filename.rstrip(file_extension), downloaded_filename.rstrip(file_extension) + "_raw")

            # Define the corrected path
            local_corrected_path = os.path.splitext(downloaded_filename)[0] + "_corrected.docx"
            # Save the corrected document
            shutil.move(downloaded_filename.rstrip(file_extension) + "_raw.docx", local_corrected_path)
        else:
            print("No replacements made.")
        return local_corrected_path

    elif file_extension == '.txt':
        lines = read_txt_file(downloaded_filename)
        corrected_lines = []

        for line in lines:
            if line.strip():
                corrected_line = call(line.strip())
                corrected_lines.append(corrected_line + '\n' if corrected_line else line)
            else:
                corrected_lines.append('\n')

        local_corrected_path = os.path.splitext(downloaded_filename)[0] + "_corrected.txt"
        write_txt_file(local_corrected_path, corrected_lines)
        return local_corrected_path

    corrected_file_url = upload_to_firebase(local_corrected_path, user_id)
    if file_extension == '.docx':
        formatted_file_url = upload_to_firebase(os.path.splitext(downloaded_filename)[0] + "_formatted.docx", user_id)
    else:
        formatted_file_url = None  # For non-docx files, there's no separate formatted file

    return corrected_file_url, formatted_file_url


def upload_to_firebase(file_path, user_id):
    try:
        bucket = storage.bucket()
        blob = bucket.blob(f"user_files/{user_id}/{os.path.basename(file_path)}")
        blob.upload_from_filename(file_path)
        return blob.public_url
    except Exception as e:
        print(f"Failed to upload file to Firebase: {e}")
        return None



def call(prompt):
    prompt_questions = ["Correct this text: "]
    additional_prompt = " Here is the corrected version"

    input_prompt = str(prompt) + '.' if not str(prompt).endswith('.') else prompt

    for question in prompt_questions:
        params = {'max_length': len(prompt), 'prompts': question + input_prompt + additional_prompt}
        response = requests.get("https://polite-horribly-cub.ngrok-free.app/generate_code", params=custom_urlencode(params))
        print("Request URL:", response.url)  # Debugging

        if response.status_code == 200:
            try:
                generated_code_list = response.json()
            except Exception as e:
                print("Failed to parse JSON response:", e)
                return None

            for res in generated_code_list:
                formatted = (str(res).split("\n\n")[0].replace("\n         ", '').split("\n        ")[0].replace('\r', '').strip())

                # More debugging information
                print("Formatted Response:", formatted)
                return formatted

        else:
            print("Failed to retrieve code. Status code:", response.status_code)
            return None

def change_sentences(replacements, original):
    if not replacements:
        print("No replacements found")
        return

    og = Document(original + ".docx")

    for og_para in og.paragraphs:
        for target_sentence, new_text in replacements.items():
            if new_text is None or target_sentence not in og_para.text:
                continue
            print(f"Replacing '{target_sentence}' with '{new_text}'")  # Debugging
            og_para.text = og_para.text.replace(target_sentence, new_text)

    og.save(original + "_raw.docx")


def change_format(source, output):
    source_doc = Document(source + ".docx")
    output_doc = Document(output + ".docx")

    for source_paragraph, output_paragraph in zip(source_doc.paragraphs, output_doc.paragraphs):
        output_paragraph.paragraph_format.alignment = source_paragraph.paragraph_format.alignment
        output_paragraph.paragraph_format.first_line_indent = source_paragraph.paragraph_format.first_line_indent
        output_paragraph.paragraph_format.left_indent = source_paragraph.paragraph_format.left_indent
        output_paragraph.paragraph_format.space_before = source_paragraph.paragraph_format.space_before
        output_paragraph.paragraph_format.space_after = source_paragraph.paragraph_format.space_after

        for source_run, output_run in zip(source_paragraph.runs, output_paragraph.runs):
            output_run.bold = source_run.bold
            output_run.italic = source_run.italic
            output_run.underline = source_run.underline
            output_run.font.name = source_run.font.name
            output_run.font.size = source_run.font.size
            output_run.font.color.rgb = source_run.font.color.rgb

    output_doc.save(source + "_formatted.docx")

def read_txt_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.readlines()

def write_txt_file(file_path, lines):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.writelines(lines)

def correct_text_file(file_path):
    extension = os.path.splitext(file_path)[1]
    if extension.lower() == '.docx':
        return correct_document_from_url(file_path)
    elif extension.lower() == '.txt':
        lines = read_txt_file(file_path)
        corrected_lines = []
        for line in lines:
            if line.strip():
                corrected_line = call(line.strip())
                corrected_lines.append(corrected_line + '\n' if corrected_line else line)
            else:
                corrected_lines.append('\n')
        corrected_file_path = file_path.replace('.txt', '_corrected.txt')
        write_txt_file(corrected_file_path, corrected_lines)
        return corrected_file_path
    else:
        print("Unsupported file format")
        return None


if __name__ == "__main__":
    start = time.perf_counter()
    doc_name = "..."
    doc = Document(doc_name + ".docx")
    replace_list = {}
    
    for paragraph in doc.paragraphs:
        if str(paragraph.text).strip() != '':
            target = paragraph.text.strip()
            answer = call(target)
            if answer:
                replace_list[target] = answer
                print(f'{target} ---> {answer}')
            else:
                print(f"No replacement for '{target}'")

    if replace_list:
        change_sentences(replace_list, doc_name)
        change_format(doc_name, doc_name + "_raw")
    else:
        print("No replacements made.")

    end = time.perf_counter()
    print("\n")
    print(f'Corrections completed in {end - start} seconds')