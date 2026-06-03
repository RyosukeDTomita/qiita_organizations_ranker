{
  description = "Qiita Organizations Ranker - Deno development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in {
      devShells.${system}.default = pkgs.mkShell {
        packages = [
          pkgs.deno
          pkgs.pinact
        ];

        # QIITA_API_KEY は .env や export で渡す想定
        shellHook = ''
          echo "Deno $(deno --version | head -n1)"
        '';
      };
    };
}
