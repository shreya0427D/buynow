
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

function App() {
  return (
    <>
      <header>
        <Show when="signed-out">
          <SignInButton mode="modal" />
          <SignUpButton mode="modal" />
        </Show>

        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>

      <p className="text-red-500 font-extrabold text-4xl bg-blue">
        Hello
      </p>

      <button className="btn btn-primary">
        Click me
      </button>
      <button className="btn btn-secondary">
        Click me
      </button>
      <button className="btn btn-outline">
        Click me
      </button>
    </>
  );
}

export default App; 
