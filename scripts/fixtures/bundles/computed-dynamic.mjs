export async function load(name) {
  return import(name);
}
