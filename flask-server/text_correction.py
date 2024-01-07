import requests
from docx import Document
from urllib.parse import quote, urlencode, urlparse
import time
import os
def custom_urlencode(params):
    return urlencode(params, quote_via=quote)

def left_whitespaces_counter(string):
    return len(string) - len(str(string).lstrip())

def download_document(url, local_path):
    try:
        response = requests.get(url)
        response.raise_for_status()

        # Extract a valid filename from the URL (if needed)
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)
        file_extension = filename.split('.')[-1] if '.' in filename else 'txt'  # Default to .txt if no extension found

        local_filename = f"{local_path}.{file_extension}"
        with open(local_filename, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"Failed to download document: {e}")
        return False


def correct_document_from_url(document_url):
    # Extract the file extension from the URL
    file_extension = document_url.rsplit('.', 1)[1].split('?')[0].lower()

    # Define the local download path without the file extension
    local_download_base_path = "downloaded_document"
    
    # Full path including extension
    local_download_path = f"{local_download_base_path}.{file_extension}"

    # Download the document from the URL
    if not download_document(document_url, local_download_base_path):
        return None  # Exit if the download fails

    # Process the document based on its file type
    if file_extension == 'docx':
        doc = Document(local_download_path)
        replace_list = {}

        for paragraph in doc.paragraphs:
            if str(paragraph.text).strip():
                target = paragraph.text.strip()
                answer = call(target)
                if answer:
                    replace_list[target] = answer

        # Apply the replacements to the document
        if replace_list:
            change_sentences(replace_list, local_download_base_path)
            change_format(local_download_base_path, local_download_base_path + "_raw")

            # Define the corrected path
            local_corrected_path = f"{local_download_base_path}_corrected.docx"
            # Save the corrected document
            os.rename(local_download_base_path + "_raw.docx", local_corrected_path)
        else:
            print("No replacements made.")
        return local_corrected_path

    elif file_extension == 'txt':
        lines = read_txt_file(local_download_path)
        corrected_lines = []

        for line in lines:
            if line.strip():
                corrected_line = call(line.strip())
                corrected_lines.append(corrected_line + '\n' if corrected_line else line)
            else:
                corrected_lines.append('\n')

        local_corrected_path = f"{local_download_base_path}_corrected.txt"
        write_txt_file(local_corrected_path, corrected_lines)
        return local_corrected_path

    else:
        print("Unsupported file format")
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